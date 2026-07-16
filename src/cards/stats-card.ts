import type { UserStats } from '../fetchers/stats.js';
import type { Theme } from '../themes.js';
import { clampValue, encodeHTML, kFormatter } from '../utils.js';
import { iconSvg, type IconName } from './icons.js';

export interface StatsCardOptions {
  theme: Theme;
  showIcons: boolean;
  lineHeight: number;
  hide: string[];
  hideBorder: boolean;
  hideRank: boolean;
  customTitle?: string;
}

interface StatTile {
  key: string;
  icon: IconName;
  label: string;
  value: number;
}

const CARD_WIDTH = 495;
const PADDING = 25;
const TILE_COLUMN_WIDTH = 165;
const RANK_RADIUS = 42;
const RANK_CIRCUMFERENCE = 2 * Math.PI * RANK_RADIUS;

function tileSvg(tile: StatTile, index: number, options: StatsCardOptions): string {
  const column = index % 2;
  const row = Math.floor(index / 2);
  const rowHeight = options.lineHeight + 21;
  const icon = options.showIcons ? iconSvg(tile.icon, 12) : '';
  const labelX = options.showIcons ? 17 : 0;
  return `
    <g transform="translate(${column * TILE_COLUMN_WIDTH}, ${row * rowHeight})">
      <g class="stagger" style="animation-delay: ${300 + index * 120}ms">
        ${icon}
        <text class="stat-label" x="${labelX}" y="10">${encodeHTML(tile.label.toUpperCase())}</text>
        <text class="stat-value" x="0" y="34" data-testid="${tile.key}">${kFormatter(tile.value)}</text>
      </g>
    </g>`;
}

export function renderStatsCard(stats: UserStats, options: StatsCardOptions): string {
  const { theme } = options;
  const currentYear = new Date().getFullYear();

  const allTiles: StatTile[] = [
    { key: 'stars', icon: 'star', label: 'Total Stars Earned', value: stats.totalStars },
    { key: 'commits', icon: 'commits', label: `Total Commits (${currentYear})`, value: stats.totalCommits },
    { key: 'prs', icon: 'prs', label: 'Total PRs', value: stats.totalPRs },
    { key: 'issues', icon: 'issues', label: 'Total Issues', value: stats.totalIssues },
    { key: 'contribs', icon: 'contribs', label: 'Contributed to (last year)', value: stats.contributedTo },
  ];
  const tiles = allTiles.filter((tile) => !options.hide.includes(tile.key));

  const rowHeight = options.lineHeight + 21;
  const rows = Math.ceil(tiles.length / 2);
  const height = Math.max(62 + rows * rowHeight + 18, options.hideRank ? 0 : 170);
  const title = options.customTitle ?? `${stats.name}'s GitHub Stats`;
  const percentile = clampValue(stats.rank.percentile, 0, 100);

  const rankRing = options.hideRank
    ? ''
    : `
    <g data-testid="rank-circle" transform="translate(415, ${height / 2})">
      <circle class="rank-ring-track" r="${RANK_RADIUS}"/>
      <circle class="rank-ring" r="${RANK_RADIUS}" stroke="url(#rank-gradient)"/>
      <text class="rank-level" y="-2" text-anchor="middle" dominant-baseline="central">${stats.rank.level}</text>
      <text class="rank-sub" y="22" text-anchor="middle">TOP ${Math.round(percentile)}%</text>
    </g>`;

  const rankStyles = options.hideRank
    ? ''
    : `
    .rank-level {
      font: 800 26px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.textColor};
    }
    .rank-sub {
      font: 600 8px 'Segoe UI', Ubuntu, Sans-Serif;
      letter-spacing: 1px;
      fill: #${theme.textColor};
      opacity: 0.6;
    }
    .rank-ring-track {
      stroke: #${theme.titleColor};
      fill: none;
      stroke-width: 5;
      opacity: 0.15;
    }
    .rank-ring {
      fill: none;
      stroke-width: 5;
      stroke-linecap: round;
      stroke-dasharray: ${RANK_CIRCUMFERENCE.toFixed(2)};
      transform: rotate(-90deg);
      animation: ringFill 1s ease-in-out forwards;
    }
    @keyframes ringFill {
      from { stroke-dashoffset: ${RANK_CIRCUMFERENCE.toFixed(2)}; }
      to { stroke-dashoffset: ${((RANK_CIRCUMFERENCE * percentile) / 100).toFixed(2)}; }
    }`;

  return `
<svg width="${CARD_WIDTH}" height="${height}" viewBox="0 0 ${CARD_WIDTH} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="card-title">
  <title id="card-title">${encodeHTML(title)}</title>
  <defs>
    <linearGradient id="rank-gradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#${theme.titleColor}"/>
      <stop offset="100%" stop-color="#${theme.iconColor}"/>
    </linearGradient>
  </defs>
  <style>
    .header {
      font: 600 17px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.titleColor};
      animation: fadeIn 0.6s ease-in-out forwards;
    }
    .stat-label {
      font: 600 9px 'Segoe UI', Ubuntu, Sans-Serif;
      letter-spacing: 0.5px;
      fill: #${theme.textColor};
      opacity: 0.7;
    }
    .stat-value {
      font: 700 21px 'Segoe UI', Ubuntu, 'Helvetica Neue', Sans-Serif;
      fill: #${theme.textColor};
    }
    .icon {
      fill: #${theme.iconColor};
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
    }${rankStyles}
    @media (prefers-reduced-motion: reduce) {
      .header, .stagger, .rank-ring {
        animation-duration: 0s;
        animation-delay: 0s;
      }
    }
  </style>
  <rect data-testid="card-bg" x="0.5" y="0.5" rx="12" width="${CARD_WIDTH - 1}" height="${height - 1}" fill="#${theme.bgColor}" stroke="#${theme.borderColor}" stroke-opacity="${options.hideBorder ? 0 : 1}"/>
  <g data-testid="card-title" transform="translate(${PADDING}, 34)">
    <text x="0" y="0" class="header">${encodeHTML(title)}</text>
  </g>
  <g data-testid="main-card-body" transform="translate(${PADDING}, 64)">
    ${tiles.map((tile, index) => tileSvg(tile, index, options)).join('')}
  </g>
  ${rankRing}
</svg>`.trim();
}
