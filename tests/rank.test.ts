import { describe, expect, it } from 'vitest';
import { calculateRank } from '../src/rank';

describe('calculateRank', () => {
  it('gives the worst percentile for an empty profile', () => {
    const rank = calculateRank({ commits: 0, prs: 0, issues: 0, reviews: 0, stars: 0, followers: 0 });
    expect(rank.percentile).toBe(100);
    expect(rank.level).toBe('C');
  });

  it('improves the percentile as activity grows', () => {
    const low = calculateRank({ commits: 10, prs: 2, issues: 1, reviews: 0, stars: 5, followers: 2 });
    const high = calculateRank({ commits: 2000, prs: 300, issues: 200, reviews: 50, stars: 5000, followers: 500 });
    expect(high.percentile).toBeLessThan(low.percentile);
  });

  it('assigns top level for extreme activity', () => {
    const rank = calculateRank({
      commits: 100000,
      prs: 10000,
      issues: 5000,
      reviews: 2000,
      stars: 100000,
      followers: 50000,
    });
    expect(rank.level).toBe('S');
  });
});
