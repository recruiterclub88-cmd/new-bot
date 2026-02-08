type GreenApiConfig = {
  baseUrl: string;
  idInstance: string;
  apiTokenInstance: string;
};

function getGreenApiConfig(): GreenApiConfig {
  // DIAGNOSTIC HARDCODE TEST
  const baseUrl = 'https://7105.api.greenapi.com';
  const idInstance = '7105475055';
  const apiTokenInstance = 'b1a61afc4dce4282997b9a6ce386255a696b16ee244d4d36ac';

  return { baseUrl, idInstance, apiTokenInstance };
}

export async function greenSendMessage(chatId: string, message: string): Promise<any> {
  const { baseUrl, idInstance, apiTokenInstance } = getGreenApiConfig();
  const url = `${baseUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Green-API sendMessage failed: ${res.status} ${text}`);
  try { return JSON.parse(text); } catch { return text; }
}
