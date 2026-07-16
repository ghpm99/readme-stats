import type { VercelRequest, VercelResponse } from '@vercel/node';
import { renderStatsCard } from '../src/cards/stats-card';
import { fetchStats } from '../src/fetchers/stats';
import { getTheme } from '../src/themes';
import { clampValue, firstQueryValue, parseBoolean, parseList, parseNumber, renderError } from '../src/utils';

const CACHE_CONTROL = 'public, max-age=14400, s-maxage=14400, stale-while-revalidate=86400';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Content-Type', 'image/svg+xml');

  const username = firstQueryValue(req.query.username);
  if (!username) {
    res.status(400).send(renderError('Missing "username" query parameter'));
    return;
  }

  try {
    const stats = await fetchStats(username);
    const svg = renderStatsCard(stats, {
      theme: getTheme(firstQueryValue(req.query.theme)),
      showIcons: parseBoolean(req.query.show_icons),
      lineHeight: clampValue(parseNumber(req.query.line_height, 25), 15, 50),
      hide: parseList(req.query.hide),
      hideBorder: parseBoolean(req.query.hide_border),
      hideRank: parseBoolean(req.query.hide_rank),
      customTitle: firstQueryValue(req.query.custom_title),
    });
    res.setHeader('Cache-Control', CACHE_CONTROL);
    res.status(200).send(svg);
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    const message = error instanceof Error ? error.message : 'Unexpected error';
    res.status(200).send(renderError(message, 'Check the server logs and configuration'));
  }
}
