import type { LanguageStat } from '../fetchers/top-languages';
import type { Theme } from '../themes';
import { clampValue, encodeHTML } from '../utils';

export interface TopLanguagesCardOptions {
  theme: Theme;
  hide: string[];
  hideLangsBelow: number;
  langsCount: number;
  hideBorder: boolean;
  customTitle?: string;
}

const CARD_WIDTH = 300;
const ROW_HEIGHT = 40;
const PADDING_X = 25;

function progressRowSvg(lang: LanguageStat, index: number): string {
  const progressWidth = CARD_WIDTH - PADDING_X * 2 - 60;
  const percentage = clampValue(lang.percentage, 0, 100);
  const filledWidth = ((progressWidth * percentage) / 100).toFixed(2);
  return `
    <g class="stagger" style="animation-delay: ${450 + index * 150}ms" transform="translate(0, ${index * ROW_HEIGHT})">
      <text data-testid="lang-name" x="2" y="15" class="lang-name">${encodeHTML(lang.name)}</text>
      <text x="${progressWidth + 10}" y="34" class="lang-name">${lang.percentage.toFixed(2)}%</text>
      <svg width="${progressWidth}" x="0" y="25">
        <rect rx="5" ry="5" x="0" y="0" width="${progressWidth}" height="8" fill="#ddd"/>
        <rect rx="5" ry="5" x="0" y="0" width="${filledWidth}" height="8" fill="#${lang.color}"/>
      </svg>
    </g>`;
}

export function renderTopLanguagesCard(
  languages: LanguageStat[],
  options: TopLanguagesCardOptions,
): string {
  const { theme } = options;

  const filtered = languages
    .filter((lang) => !options.hide.includes(lang.name.toLowerCase()))
    .filter((lang) => lang.percentage >= options.hideLangsBelow)
    .slice(0, clampValue(options.langsCount, 1, 20));

  const totalSize = filtered.reduce((sum, lang) => sum + lang.size, 0);
  const normalized = filtered.map((lang) => ({
    ...lang,
    percentage: totalSize === 0 ? 0 : (lang.size / totalSize) * 100,
  }));

  const title = options.customTitle ?? 'Most Used Languages';
  const height = Math.max(45 + (normalized.length + 1) * ROW_HEIGHT, 145);

  const body =
    normalized.length === 0
      ? '<text x="2" y="15" class="lang-name">No language data available</text>'
      : normalized.map((lang, index) => progressRowSvg(lang, index)).join('');

  return `
<svg width="${CARD_WIDTH}" height="${height}" viewBox="0 0 ${CARD_WIDTH} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="card-title">
  <title id="card-title">${encodeHTML(title)}</title>
  <style>
    .header {
      font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.titleColor};
      animation: fadeInAnimation 0.8s ease-in-out forwards;
    }
    .lang-name {
      font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.textColor};
    }
    .stagger {
      opacity: 0;
      animation: fadeInAnimation 0.3s ease-in-out forwards;
    }
    @keyframes fadeInAnimation {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  </style>
  <rect data-testid="card-bg" x="0.5" y="0.5" rx="4.5" width="${CARD_WIDTH - 1}" height="99%" fill="#${theme.bgColor}" stroke="#${theme.borderColor}" stroke-opacity="${options.hideBorder ? 0 : 1}"/>
  <g data-testid="card-title" transform="translate(25, 35)">
    <text x="0" y="0" class="header">${encodeHTML(title)}</text>
  </g>
  <g data-testid="main-card-body" transform="translate(${PADDING_X}, 55)">
    ${body}
  </g>
</svg>`.trim();
}
