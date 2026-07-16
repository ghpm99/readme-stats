const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

export class GithubApiError extends Error {}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { type?: string; message: string }[];
}

export async function githubGraphQL<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const token = process.env.GITHUB_TOKEN ?? process.env.PAT_1;
  if (!token) {
    throw new GithubApiError('GitHub token is not configured (set the GITHUB_TOKEN env var)');
  }

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new GithubApiError(`GitHub API responded with status ${response.status}`);
  }

  const json = (await response.json()) as GraphQLResponse<T>;
  if (json.errors && json.errors.length > 0) {
    throw new GithubApiError(json.errors[0]?.message ?? 'GitHub API returned an error');
  }
  if (!json.data) {
    throw new GithubApiError('GitHub API returned an empty response');
  }
  return json.data;
}
