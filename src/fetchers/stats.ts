import { calculateRank, type Rank } from '../rank';
import { githubGraphQL } from './github';

export interface UserStats {
  name: string;
  totalStars: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  contributedTo: number;
  rank: Rank;
}

interface StatsQueryData {
  user: {
    name: string | null;
    login: string;
    contributionsCollection: {
      totalCommitContributions: number;
      totalPullRequestReviewContributions: number;
    };
    repositoriesContributedTo: { totalCount: number };
    pullRequests: { totalCount: number };
    openIssues: { totalCount: number };
    closedIssues: { totalCount: number };
    followers: { totalCount: number };
    repositories: {
      totalCount: number;
      nodes: { stargazers: { totalCount: number } }[];
    };
  } | null;
}

const STATS_QUERY = `
  query userStats($login: String!) {
    user(login: $login) {
      name
      login
      contributionsCollection {
        totalCommitContributions
        totalPullRequestReviewContributions
      }
      repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
        totalCount
      }
      pullRequests(first: 1) {
        totalCount
      }
      openIssues: issues(states: OPEN) {
        totalCount
      }
      closedIssues: issues(states: CLOSED) {
        totalCount
      }
      followers {
        totalCount
      }
      repositories(first: 100, ownerAffiliations: OWNER, orderBy: { direction: DESC, field: STARGAZERS }) {
        totalCount
        nodes {
          stargazers {
            totalCount
          }
        }
      }
    }
  }
`;

export async function fetchStats(username: string): Promise<UserStats> {
  const data = await githubGraphQL<StatsQueryData>(STATS_QUERY, { login: username });
  if (!data.user) {
    throw new Error(`Could not find a GitHub user named "${username}"`);
  }
  const user = data.user;

  const totalStars = user.repositories.nodes.reduce(
    (total, repo) => total + repo.stargazers.totalCount,
    0,
  );
  const totalCommits = user.contributionsCollection.totalCommitContributions;
  const totalPRs = user.pullRequests.totalCount;
  const totalIssues = user.openIssues.totalCount + user.closedIssues.totalCount;

  return {
    name: user.name ?? user.login,
    totalStars,
    totalCommits,
    totalPRs,
    totalIssues,
    contributedTo: user.repositoriesContributedTo.totalCount,
    rank: calculateRank({
      commits: totalCommits,
      prs: totalPRs,
      issues: totalIssues,
      reviews: user.contributionsCollection.totalPullRequestReviewContributions,
      stars: totalStars,
      followers: user.followers.totalCount,
    }),
  };
}
