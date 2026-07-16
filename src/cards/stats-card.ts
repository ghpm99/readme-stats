import type { UserStats } from '../fetchers/stats';
import type { Theme } from '../themes';
import { clampValue, encodeHTML, kFormatter } from '../utils';
import { iconSvg, type IconName } from './icons';

export interface StatsCardOptions {
  theme: Theme;
  showIcons: boolean;
  lineHeight: number;
  hide: string[];
  hideBorder: boolean;
  hideRank: boolean;
  customTitle?: string;
}

interface StatRow {
  key: string;
  icon: IconName;
  label: string;
  value: number;
}

const CARD_WIDTH = 495;
const RANK_RADIUS = 40;
const RANK_CIRCUMFERENCE = 2 * Math.PI * RANK_RADIUS;

function rankCircleOffset(percentile: number): number {
  const progress = 100 - clampValue(percentile, 0, 100);
  return ((100 - progress) / 100) * RANK_CIRCUMFERENCE;
}

function statRowSvg(row: StatRow, index: number, options: StatsCardOptions): string {
  const labelX = options.showIcons ? 25 : 0;
  const icon = options.showIcons ? iconSvg(row.icon) : '';
  return `
    <g class="stagger" style="animation-delay: ${450 + index * 150}ms" transform="translate(25, ${index * options.lineHeight})">
      ${icon}
      <text class="stat bold" x="${labelX}" y="12.5">${row.label}:</text>
      <text class="stat bold" x="${labelX + 195}" y="12.5" data-testid="${row.key}">${kFormatter(row.value)}</text>
    </g>`;
}

export function renderStatsCard(stats: UserStats, options: StatsCardOptions): string {
  const { theme } = options;
  const currentYear = new Date().getFullYear();

  const allRows: StatRow[] = [
    { key: 'stars', icon: 'star', label: 'Total Stars Earned', value: stats.totalStars },
    { key: 'commits', icon: 'commits', label: `Total Commits (${currentYear})`, value: stats.totalCommits },
    { key: 'prs', icon: 'prs', label: 'Total PRs', value: stats.totalPRs },
    { key: 'issues', icon: 'issues', label: 'Total Issues', value: stats.totalIssues },
    { key: 'contribs', icon: 'contribs', label: 'Contributed to (last year)', value: stats.contributedTo },
  ];
  const rows = allRows.filter((row) => !options.hide.includes(row.key));

  const height = Math.max(45 + (rows.length + 1) * options.lineHeight, options.hideRank ? 0 : 150);
  const title = options.customTitle ?? `${stats.name}'s GitHub Stats`;

  const rankCircle = options.hideRank
    ? ''
    : `
    <g data-testid="rank-circle" transform="translate(400, ${height / 2 - 50})">
      <circle class="rank-circle-rim" cx="-10" cy="8" r="${RANK_RADIUS}"/>
      <circle class="rank-circle" cx="-10" cy="8" r="${RANK_RADIUS}"/>
      <g class="rank-text">
        <text x="-5" y="3" alignment-baseline="central" dominant-baseline="central" text-anchor="middle">
          ${stats.rank.level}
        </text>
      </g>
    </g>`;

  const rankStyles = options.hideRank
    ? ''
    : `
    .rank-text {
      font: 800 24px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.textColor};
      animation: scaleInAnimation 0.3s ease-in-out forwards;
    }
    .rank-circle-rim {
      stroke: #${theme.titleColor};
      fill: none;
      stroke-width: 6;
      opacity: 0.2;
    }
    .rank-circle {
      stroke: #${theme.titleColor};
      stroke-dasharray: ${RANK_CIRCUMFERENCE.toFixed(2)};
      fill: none;
      stroke-width: 6;
      stroke-linecap: round;
      opacity: 0.8;
      transform-origin: -10px 8px;
      transform: rotate(-90deg);
      animation: rankAnimation 1s forwards ease-in-out;
    }
    @keyframes rankAnimation {
      from { stroke-dashoffset: ${RANK_CIRCUMFERENCE.toFixed(2)}; }
      to { stroke-dashoffset: ${rankCircleOffset(stats.rank.percentile).toFixed(2)}; }
    }
    @keyframes scaleInAnimation {
      from { transform: translate(-5px, 5px) scale(0); }
      to { transform: translate(-5px, 5px) scale(1); }
    }`;

  return `
<svg width="${CARD_WIDTH}" height="${height}" viewBox="0 0 ${CARD_WIDTH} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="card-title">
  <title id="card-title">${encodeHTML(title)}</title>
  <style>
    .header {
      font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.titleColor};
      animation: fadeInAnimation 0.8s ease-in-out forwards;
    }
    .stat {
      font: 600 14px 'Segoe UI', Ubuntu, 'Helvetica Neue', Sans-Serif;
      fill: #${theme.textColor};
    }
    .stagger {
      opacity: 0;
      animation: fadeInAnimation 0.3s ease-in-out forwards;
    }
    .icon {
      fill: #${theme.iconColor};
    }
    @keyframes fadeInAnimation {
      from { opacity: 0; }
      to { opacity: 1; }
    }${rankStyles}
  </style>
  <rect data-testid="card-bg" x="0.5" y="0.5" rx="4.5" width="${CARD_WIDTH - 1}" height="99%" fill="#${theme.bgColor}" stroke="#${theme.borderColor}" stroke-opacity="${options.hideBorder ? 0 : 1}"/>
  <g data-testid="card-title" transform="translate(25, 35)">
    <text x="0" y="0" class="header">${encodeHTML(title)}</text>
  </g>
  <g data-testid="main-card-body" transform="translate(0, 55)">
    ${rankCircle}
    <svg x="0" y="0">
      ${rows.map((row, index) => statRowSvg(row, index, options)).join('')}
    </svg>
  </g>
</svg>`.trim();
}
