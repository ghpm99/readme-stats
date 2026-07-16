export function kFormatter(num: number): string {
  if (Math.abs(num) < 1000) return String(num);
  return `${(Math.sign(num) * (Math.abs(num) / 1000)).toFixed(1)}k`;
}

export function encodeHTML(str: string): string {
  return str.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

export function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export function firstQueryValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseBoolean(value: string | string[] | undefined): boolean {
  return firstQueryValue(value) === 'true';
}

export function parseNumber(value: string | string[] | undefined, fallback: number): number {
  const parsed = Number.parseFloat(firstQueryValue(value) ?? '');
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function parseList(value: string | string[] | undefined): string[] {
  const raw = firstQueryValue(value);
  if (!raw) return [];
  return raw
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length > 0);
}

export function renderError(message: string, secondaryMessage = ''): string {
  return `
<svg width="495" height="120" viewBox="0 0 495 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .text { font: 600 16px 'Segoe UI', Ubuntu, Sans-Serif; fill: #2f80ed; }
    .small { font: 600 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: #252525; }
  </style>
  <rect x="0.5" y="0.5" width="494" height="99%" rx="4.5" fill="#fffefe" stroke="#e4e2e2"/>
  <text x="25" y="45" class="text">Something went wrong!</text>
  <text x="25" y="75" class="small">${encodeHTML(message)}</text>
  <text x="25" y="95" class="small">${encodeHTML(secondaryMessage)}</text>
</svg>`.trim();
}
