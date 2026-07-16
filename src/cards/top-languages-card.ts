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
const PADDING = 25;
const INNER_WIDTH = CARD_WIDTH - PADDING * 2;
const BAR_HEIGHT = 10;
const SEGMENT_GAP = 2;
const MIN_SEGMENT_WIDTH = 6;
const LEGEND_ROW_HEIGHT = 22;
const LEGEND_COLUMN_WIDTH = 125;

function truncateName(name: string): string {
  return name.length > 14 ? `${name.slice(0, 13)}…` : name;
}

function barSegmentsSvg(languages: LanguageStat[]): string {
  const available = INNER_WIDTH - SEGMENT_GAP * (languages.length - 1);
  let x = 0;
  return languages
    .map((lang, index) => {
      const width = Math.max((available * clampValue(lang.percentage, 0, 100)) / 100, MIN_SEGMENT_WIDTH);
      const segment = `
      <rect class="bar-seg" style="animation-delay: ${200 + index * 100}ms" x="${x.toFixed(2)}" y="0" width="${width.toFixed(2)}" height="${BAR_HEIGHT}" rx="${BAR_HEIGHT / 2}" fill="#${lang.color}"/>`;
      x += width + SEGMENT_GAP;
      return segment;
    })
    .join('');
}

function legendItemSvg(lang: LanguageStat, index: number): string {
  const column = index % 2;
  const row = Math.floor(index / 2);
  return `
    <g transform="translate(${column * LEGEND_COLUMN_WIDTH}, ${row * LEGEND_ROW_HEIGHT})">
      <g class="stagger" style="animation-delay: ${400 + index * 100}ms">
        <circle cx="4" cy="8" r="4" fill="#${lang.color}"/>
        <text data-testid="lang-name" x="14" y="12" class="lang-name">${encodeHTML(truncateName(lang.name))} <tspan class="lang-pct">${lang.percentage.toFixed(1)}%</tspan></text>
      </g>
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
  const legendRows = Math.ceil(normalized.length / 2);
  const height =
    normalized.length === 0 ? 130 : Math.max(55 + 34 + legendRows * LEGEND_ROW_HEIGHT + 10, 130);

  const body =
    normalized.length === 0
      ? '<text x="0" y="12" class="lang-name">No language data available</text>'
      : `
    ${barSegmentsSvg(normalized)}
    <g transform="translate(0, 34)">
      ${normalized.map((lang, index) => legendItemSvg(lang, index)).join('')}
    </g>`;

  return `
<svg width="${CARD_WIDTH}" height="${height}" viewBox="0 0 ${CARD_WIDTH} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="card-title">
  <title id="card-title">${encodeHTML(title)}</title>
  <style>
    .header {
      font: 600 17px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.titleColor};
      animation: fadeIn 0.6s ease-in-out forwards;
    }
    .lang-name {
      font: 500 11px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.textColor};
    }
    .lang-pct {
      font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.textColor};
      opacity: 0.6;
    }
    .bar-seg {
      transform: scaleX(0);
      transform-box: fill-box;
      transform-origin: left center;
      animation: growX 0.6s ease-out forwards;
    }
    .stagger {
      opacity: 0;
      animation: fadeUp 0.5s ease-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes growX {
      from { transform: scaleX(0); }
      to { transform: scaleX(1); }
    }
    @media (prefers-reduced-motion: reduce) {
      .header, .stagger, .bar-seg {
        animation-duration: 0s;
        animation-delay: 0s;
      }
    }
  </style>
  <rect data-testid="card-bg" x="0.5" y="0.5" rx="12" width="${CARD_WIDTH - 1}" height="${height - 1}" fill="#${theme.bgColor}" stroke="#${theme.borderColor}" stroke-opacity="${options.hideBorder ? 0 : 1}"/>
  <g data-testid="card-title" transform="translate(${PADDING}, 34)">
    <text x="0" y="0" class="header">${encodeHTML(title)}</text>
  </g>
  <g data-testid="main-card-body" transform="translate(${PADDING}, 55)">
    ${body}
  </g>
</svg>`.trim();
}
