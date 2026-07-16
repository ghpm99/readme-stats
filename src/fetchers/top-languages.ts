import { githubGraphQL } from './github';

export interface LanguageStat {
  name: string;
  color: string;
  size: number;
  percentage: number;
}

interface TopLanguagesQueryData {
  user: {
    repositories: {
      nodes: {
        name: string;
        languages: {
          edges: { size: number; node: { color: string | null; name: string } }[];
        };
      }[];
    };
  } | null;
}

const TOP_LANGUAGES_QUERY = `
  query topLanguages($login: String!) {
    user(login: $login) {
      repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
        nodes {
          name
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                color
                name
              }
            }
          }
        }
      }
    }
  }
`;

const FALLBACK_COLOR = '858585';

export async function fetchTopLanguages(username: string): Promise<LanguageStat[]> {
  const data = await githubGraphQL<TopLanguagesQueryData>(TOP_LANGUAGES_QUERY, { login: username });
  if (!data.user) {
    throw new Error(`Could not find a GitHub user named "${username}"`);
  }

  const totals = new Map<string, { color: string; size: number }>();
  for (const repo of data.user.repositories.nodes) {
    for (const edge of repo.languages.edges) {
      const current = totals.get(edge.node.name);
      totals.set(edge.node.name, {
        color: edge.node.color?.replace('#', '') ?? FALLBACK_COLOR,
        size: (current?.size ?? 0) + edge.size,
      });
    }
  }

  const totalSize = [...totals.values()].reduce((sum, lang) => sum + lang.size, 0);
  if (totalSize === 0) return [];

  return [...totals.entries()]
    .map(([name, { color, size }]) => ({
      name,
      color,
      size,
      percentage: (size / totalSize) * 100,
    }))
    .sort((a, b) => b.size - a.size);
}
