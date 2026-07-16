import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GithubApiError, githubGraphQL } from '../src/fetchers/github.js';
import { fetchStats } from '../src/fetchers/stats.js';
import { fetchTopLanguages } from '../src/fetchers/top-languages.js';

function mockFetchResponse(body: unknown, ok = true, status = 200): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status,
      json: () => Promise.resolve(body),
    }),
  );
}

beforeEach(() => {
  vi.stubEnv('GITHUB_TOKEN', 'test-token');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('githubGraphQL', () => {
  it('throws when no token is configured', async () => {
    vi.stubEnv('GITHUB_TOKEN', '');
    vi.stubEnv('PAT_1', '');
    await expect(githubGraphQL('query {}', {})).rejects.toThrow(GithubApiError);
  });

  it('throws on http errors', async () => {
    mockFetchResponse({}, false, 502);
    await expect(githubGraphQL('query {}', {})).rejects.toThrow('502');
  });

  it('throws the first graphql error message', async () => {
    mockFetchResponse({ errors: [{ message: 'rate limited' }] });
    await expect(githubGraphQL('query {}', {})).rejects.toThrow('rate limited');
  });
});

describe('fetchStats', () => {
  it('aggregates totals and computes a rank', async () => {
    mockFetchResponse({
      data: {
        user: {
          name: 'Gustavo',
          login: 'ghpm99',
          contributionsCollection: {
            totalCommitContributions: 500,
            totalPullRequestReviewContributions: 10,
          },
          repositoriesContributedTo: { totalCount: 8 },
          pullRequests: { totalCount: 90 },
          openIssues: { totalCount: 5 },
          closedIssues: { totalCount: 15 },
          followers: { totalCount: 40 },
          repositories: {
            totalCount: 2,
            nodes: [{ stargazers: { totalCount: 30 } }, { stargazers: { totalCount: 12 } }],
          },
        },
      },
    });

    const stats = await fetchStats('ghpm99');
    expect(stats.name).toBe('Gustavo');
    expect(stats.totalStars).toBe(42);
    expect(stats.totalCommits).toBe(500);
    expect(stats.totalPRs).toBe(90);
    expect(stats.totalIssues).toBe(20);
    expect(stats.contributedTo).toBe(8);
    expect(stats.rank.percentile).toBeGreaterThan(0);
    expect(stats.rank.percentile).toBeLessThan(100);
  });

  it('throws when the user does not exist', async () => {
    mockFetchResponse({ data: { user: null } });
    await expect(fetchStats('nobody')).rejects.toThrow('nobody');
  });
});

describe('fetchTopLanguages', () => {
  it('aggregates language sizes across repositories', async () => {
    mockFetchResponse({
      data: {
        user: {
          repositories: {
            nodes: [
              {
                name: 'repo-a',
                languages: {
                  edges: [
                    { size: 600, node: { color: '#3178c6', name: 'TypeScript' } },
                    { size: 100, node: { color: '#e34c26', name: 'HTML' } },
                  ],
                },
              },
              {
                name: 'repo-b',
                languages: {
                  edges: [
                    { size: 300, node: { color: '#3178c6', name: 'TypeScript' } },
                    { size: 0, node: { color: null, name: 'Makefile' } },
                  ],
                },
              },
            ],
          },
        },
      },
    });

    const languages = await fetchTopLanguages('ghpm99');
    expect(languages[0]).toMatchObject({ name: 'TypeScript', color: '3178c6', size: 900 });
    expect(languages[0]?.percentage).toBeCloseTo(90);
    expect(languages.find((lang) => lang.name === 'Makefile')?.color).toBe('858585');
  });

  it('returns an empty list when there is no language data', async () => {
    mockFetchResponse({ data: { user: { repositories: { nodes: [] } } } });
    await expect(fetchTopLanguages('ghpm99')).resolves.toEqual([]);
  });
});
