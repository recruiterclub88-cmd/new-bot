export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function normalizeText(t: string): string {
  return (t || '').toString().replace(/\s+/g,' ').trim();
}

export function hasOptOut(text: string): boolean {
  const t = text.toLowerCase();
  return ['stop','не пиши','отстань','убери','не надо','хватит','unsubscribe'].some(k => t.includes(k));
}
