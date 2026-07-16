import { describe, expect, it } from 'vitest';
import { renderStatsCard, type StatsCardOptions } from '../src/cards/stats-card.js';
import type { UserStats } from '../src/fetchers/stats.js';
import { getTheme } from '../src/themes.js';

const stats: UserStats = {
  name: 'ghpm99',
  totalStars: 120,
  totalCommits: 1500,
  totalPRs: 80,
  totalIssues: 30,
  contributedTo: 12,
  rank: { level: 'A+', percentile: 20 },
};

const baseOptions: StatsCardOptions = {
  theme: getTheme('dracula'),
  showIcons: true,
  lineHeight: 27,
  hide: [],
  hideBorder: false,
  hideRank: false,
};

describe('renderStatsCard', () => {
  it('renders title, values and rank level', () => {
    const svg = renderStatsCard(stats, baseOptions);
    expect(svg).toContain('ghpm99&#39;s GitHub Stats');
    expect(svg).toContain('1.5k');
    expect(svg).toContain('A+');
    expect(svg).toContain('TOP 20%');
    expect(svg).toContain('data-testid="stars"');
  });

  it('applies the dracula theme colors', () => {
    const svg = renderStatsCard(stats, baseOptions);
    expect(svg).toContain('#282a36');
    expect(svg).toContain('#ff6e96');
    expect(svg).toContain('#79dafa');
  });

  it('hides stats listed in hide', () => {
    const svg = renderStatsCard(stats, { ...baseOptions, hide: ['issues', 'contribs'] });
    expect(svg).not.toContain('TOTAL ISSUES');
    expect(svg).not.toContain('CONTRIBUTED TO');
    expect(svg).toContain('TOTAL PRS');
  });

  it('omits icons when show_icons is false', () => {
    const svg = renderStatsCard(stats, { ...baseOptions, showIcons: false });
    expect(svg).not.toContain('class="icon"');
  });

  it('omits the rank circle when hideRank is set', () => {
    const svg = renderStatsCard(stats, { ...baseOptions, hideRank: true });
    expect(svg).not.toContain('rank-circle');
  });

  it('grows height with line_height', () => {
    const short = renderStatsCard(stats, { ...baseOptions, lineHeight: 25 });
    const tall = renderStatsCard(stats, { ...baseOptions, lineHeight: 30 });
    const heightOf = (svg: string) => Number(/height="(\d+)"/.exec(svg)?.[1]);
    expect(heightOf(tall)).toBeGreaterThan(heightOf(short));
  });

  it('escapes html in user provided names', () => {
    const svg = renderStatsCard({ ...stats, name: '<img src=x>' }, baseOptions);
    expect(svg).not.toContain('<img');
  });
});
