type GreenApiConfig = {
  baseUrl: string;
  idInstance: string;
  apiTokenInstance: string;
};

function getGreenApiConfig(): GreenApiConfig {
  const baseUrl = process.env.GREEN_API_BASE_URL || 'https://api.green-api.com';
  const idInstance = process.env.GREEN_API_ID_INSTANCE || '';
  const apiTokenInstance = process.env.GREEN_API_TOKEN || '';
  if (!idInstance || !apiTokenInstance) {
    throw new Error('Missing GREEN_API_ID_INSTANCE / GREEN_API_TOKEN');
  }
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
