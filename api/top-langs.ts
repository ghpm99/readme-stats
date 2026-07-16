import type { VercelRequest, VercelResponse } from '@vercel/node';
import { renderTopLanguagesCard } from '../src/cards/top-languages-card.js';
import { fetchTopLanguages } from '../src/fetchers/top-languages.js';
import { getTheme } from '../src/themes.js';
import { clampValue, firstQueryValue, parseBoolean, parseList, parseNumber, renderError } from '../src/utils.js';

const CACHE_CONTROL = 'public, max-age=14400, s-maxage=14400, stale-while-revalidate=86400';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Content-Type', 'image/svg+xml');

  const username = firstQueryValue(req.query.username);
  if (!username) {
    res.status(400).send(renderError('Missing "username" query parameter'));
    return;
  }

  try {
    const languages = await fetchTopLanguages(username);
    const svg = renderTopLanguagesCard(languages, {
      theme: getTheme(firstQueryValue(req.query.theme)),
      hide: parseList(req.query.hide),
      hideLangsBelow: clampValue(parseNumber(req.query.hide_langs_below, 0), 0, 100),
      langsCount: Math.round(parseNumber(req.query.langs_count, 5)),
      hideBorder: parseBoolean(req.query.hide_border),
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
