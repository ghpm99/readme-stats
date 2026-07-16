export interface RankParams {
  commits: number;
  prs: number;
  issues: number;
  reviews: number;
  stars: number;
  followers: number;
}

export interface Rank {
  level: string;
  percentile: number;
}

function exponentialCdf(x: number): number {
  return 1 - 2 ** -x;
}

function logNormalCdf(x: number): number {
  return x / (1 + x);
}

const COMMITS_MEDIAN = 250;
const COMMITS_WEIGHT = 2;
const PRS_MEDIAN = 50;
const PRS_WEIGHT = 3;
const ISSUES_MEDIAN = 25;
const ISSUES_WEIGHT = 1;
const REVIEWS_MEDIAN = 2;
const REVIEWS_WEIGHT = 1;
const STARS_MEDIAN = 50;
const STARS_WEIGHT = 4;
const FOLLOWERS_MEDIAN = 10;
const FOLLOWERS_WEIGHT = 1;

const TOTAL_WEIGHT =
  COMMITS_WEIGHT + PRS_WEIGHT + ISSUES_WEIGHT + REVIEWS_WEIGHT + STARS_WEIGHT + FOLLOWERS_WEIGHT;

const THRESHOLDS = [1, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];
const LEVELS = ['S', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'];

export function calculateRank({ commits, prs, issues, reviews, stars, followers }: RankParams): Rank {
  const score =
    1 -
    (COMMITS_WEIGHT * exponentialCdf(commits / COMMITS_MEDIAN) +
      PRS_WEIGHT * exponentialCdf(prs / PRS_MEDIAN) +
      ISSUES_WEIGHT * exponentialCdf(issues / ISSUES_MEDIAN) +
      REVIEWS_WEIGHT * exponentialCdf(reviews / REVIEWS_MEDIAN) +
      STARS_WEIGHT * logNormalCdf(stars / STARS_MEDIAN) +
      FOLLOWERS_WEIGHT * logNormalCdf(followers / FOLLOWERS_MEDIAN)) /
      TOTAL_WEIGHT;

  const percentile = score * 100;
  const index = THRESHOLDS.findIndex((threshold) => percentile <= threshold);
  return { level: LEVELS[index === -1 ? LEVELS.length - 1 : index] ?? 'C', percentile };
}
