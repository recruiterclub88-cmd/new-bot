import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/db';
import { callGemini } from '@/lib/server/gemini';
import { greenSendMessage } from '@/lib/server/greenapi';
import { hasOptOut, normalizeText } from '@/lib/server/util';
import { randInt, sleep } from '@/lib/server/util';

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.warn(`⚠️ Missing environment variable: ${name}`);
    return '';
  }
  return v;
}

function getSecretFromReq(req: Request): string | null {
  const url = new URL(req.url);
  return req.headers.get('x-webhook-secret') || url.searchParams.get('secret');
}


function parseGreenWebhook(body: any): { chatId: string; messageId: string; text: string } | null {
  const chatId =
    body?.senderData?.chatId ||
    body?.chatId ||
    body?.chatID ||
    body?.data?.chatId;

  const messageId =
    body?.idMessage ||
    body?.messageId ||
    body?.id ||
    body?.data?.idMessage ||
    body?.senderData?.idMessage;

  const text =
    body?.messageData?.textMessageData?.textMessage ||
    body?.messageData?.extendedTextMessageData?.text ||
    body?.messageData?.quotedMessage?.textMessageData?.textMessage ||
    body?.text ||
    body?.data?.text;

  if (!chatId || !messageId || !text) return null;
  return { chatId: String(chatId), messageId: String(messageId), text: String(text) };
}



export async function POST(req: Request) {
  // secret check
  const secret = getSecretFromReq(req);
  const expectedSecret = required('WEBHOOK_SECRET');
  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  if (!body) return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });

  const parsed = parseGreenWebhook(body);
  if (!parsed) return NextResponse.json({ ok: true, ignored: true });

  const chatId = parsed.chatId;
  const providerMessageId = parsed.messageId;
  const userText = normalizeText(parsed.text);

  // opt-out
  if (hasOptOut(userText)) {
    await supabaseAdmin.from('contacts').upsert({ wa_chat_id: chatId, opt_out: true, updated_at: new Date().toISOString() }, { onConflict: 'wa_chat_id' });
    return NextResponse.json({ ok: true, opted_out: true });
  }

  // upsert contact
  const { data: contactRow } = await supabaseAdmin
    .from('contacts')
    .select('id, stage, summary, lead_type, opt_out')
    .eq('wa_chat_id', chatId)
    .maybeSingle();

  let contact = contactRow;
  if (!contact) {
    const { data: inserted, error } = await supabaseAdmin
      .from('contacts')
      .insert({ wa_chat_id: chatId, stage: 'start', lead_type: 'unknown', summary: '', opt_out: false })
      .select('id, stage, summary, lead_type, opt_out')
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    contact = inserted;
  } else if (contact.opt_out) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const contactId = contact.id;


  // dedup: try insert inbound message unique by provider_message_id
  const { error: inErr } = await supabaseAdmin.from('messages').insert({
    contact_id: contactId,
    direction: 'in',
    provider_message_id: providerMessageId,
    text: userText,
  });

  if (inErr) {
    // if duplicate, just ignore
    if (String(inErr.message || '').toLowerCase().includes('duplicate')) {
      return NextResponse.json({ ok: true, dedup: true });
    }
    // other errors still proceed cautiously
  }

  // load settings in one batch to reduce RTT (critical for Vercel timeout)
  const { data: settingsRows } = await supabaseAdmin
    .from('settings')
    .select('key, value')
    .in('key', ['system_prompt', 'site_url', 'candidate_link', 'agency_link', 'tone']);

  const settings: Record<string, string> = {};
  (settingsRows || []).forEach((row: any) => settings[row.key] = row.value);


  const systemPrompt = settings['system_prompt'] || '';
  const siteUrl = settings['site_url'] || '';
  const candidateLink = settings['candidate_link'] || '';
  const agencyLink = settings['agency_link'] || '';
  const tone = settings['tone'] || '';


  const stage = contact.stage || 'start';
  const summary = contact.summary || '';


  const { data: recentMsgs } = await supabaseAdmin
    .from('messages')
    .select('direction,text')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: true })
    .limit(30);

  const memory = { summary, recent: (recentMsgs || []).map((m: any) => ({ direction: m.direction, text: m.text })) };


  const fullPrompt = [
    systemPrompt || '',
    tone ? `\nТон общения: ${tone}` : '',
    siteUrl ? `\nОсновной сайт: ${siteUrl}` : '',
    candidateLink ? `\nСсылка для кандидата: ${candidateLink}` : '',
    agencyLink ? `\nСсылка для агентства: ${agencyLink}` : '',
  ].join('\n');

  const ai = await callGemini({ systemPrompt: fullPrompt, userText, memory, stage });

  let reply = normalizeText(ai.reply);
  if (!reply) reply = 'Понял. Напиши, пожалуйста: страна и какая работа интересует.';

  // If need_link, append correct link (simple heuristic)
  if (ai.need_link) {
    const link = (ai.lead_type === 'agency' ? agencyLink : candidateLink) || siteUrl;
    if (link) reply = `${reply}\n\nАнкета/регистрация: ${link}`;
  }

  // random human delay (reduced for Vercel 10s timeout)
  await sleep(randInt(1000, 5000));


  // send message
  try {
    await greenSendMessage(chatId, reply);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }

  // store outbound
  await supabaseAdmin.from('messages').insert({
    contact_id: contactId,
    direction: 'out',
    provider_message_id: `out:${providerMessageId}`,
    text: reply,
  });

  // update contact stage and summary
  const nextStage = ai.next_stage || stage;
  const newSummary = ai.memory_update ? (summary ? (summary + '\n' + ai.memory_update) : ai.memory_update) : summary;

  await supabaseAdmin.from('contacts').update({
    stage: nextStage,
    summary: newSummary.slice(0, 2000),
    lead_type: ai.lead_type || 'unknown',
    updated_at: new Date().toISOString(),
  }).eq('id', contactId);

  return NextResponse.json({ ok: true });
}
