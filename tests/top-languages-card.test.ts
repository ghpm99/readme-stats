import { describe, expect, it } from 'vitest';
import { renderTopLanguagesCard, type TopLanguagesCardOptions } from '../src/cards/top-languages-card';
import type { LanguageStat } from '../src/fetchers/top-languages';
import { getTheme } from '../src/themes';

const languages: LanguageStat[] = [
  { name: 'TypeScript', color: '3178c6', size: 6000, percentage: 60 },
  { name: 'Python', color: '3572A5', size: 3000, percentage: 30 },
  { name: 'HTML', color: 'e34c26', size: 950, percentage: 9.5 },
  { name: 'Shell', color: '89e051', size: 50, percentage: 0.5 },
];

const baseOptions: TopLanguagesCardOptions = {
  theme: getTheme('dracula'),
  hide: [],
  hideLangsBelow: 0,
  langsCount: 10,
  hideBorder: false,
};

describe('renderTopLanguagesCard', () => {
  it('renders every language with its color', () => {
    const svg = renderTopLanguagesCard(languages, baseOptions);
    expect(svg).toContain('TypeScript');
    expect(svg).toContain('#3178c6');
    expect(svg).toContain('Shell');
  });

  it('filters languages below hide_langs_below and renormalizes percentages', () => {
    const svg = renderTopLanguagesCard(languages, { ...baseOptions, hideLangsBelow: 1 });
    expect(svg).not.toContain('Shell');
    expect(svg).toContain('60.30%');
  });

  it('limits the number of languages with langs_count', () => {
    const svg = renderTopLanguagesCard(languages, { ...baseOptions, langsCount: 2 });
    expect(svg).toContain('TypeScript');
    expect(svg).toContain('Python');
    expect(svg).not.toContain('HTML');
  });

  it('hides languages listed in hide', () => {
    const svg = renderTopLanguagesCard(languages, { ...baseOptions, hide: ['html', 'shell'] });
    expect(svg).not.toContain('HTML');
    expect(svg).not.toContain('Shell');
  });

  it('renders a fallback message when no languages remain', () => {
    const svg = renderTopLanguagesCard([], baseOptions);
    expect(svg).toContain('No language data available');
  });
});
