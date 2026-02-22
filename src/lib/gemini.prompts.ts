import type { PredictionInput } from '@/lib/gemini';

/**
 * Builds the prompt sent to Gemini.
 * Asks for: winner, approximate score, confidence, reasoning, and injury/suspension warnings.
 */
export function buildPredictionPrompt(input: PredictionInput): string {
  const oddsLine = input.odds
    ? `Betting odds — Home win: ${input.odds.home}, Draw: ${input.odds.draw}, Away win: ${input.odds.away}.`
    : 'No betting odds available.';

  const newsBlock = input.recentNews?.length
    ? input.recentNews.map((n, i) => `  [${i + 1}] ${n}`).join('\n')
    : '  (no news available)';

  return [
    'You are an expert football analyst with deep knowledge of team form, tactics, and player availability.',
    '',
    `Match: ${input.homeTeam} (home) vs ${input.awayTeam} (away)`,
    oddsLine,
    '',
    'Context (news, injuries, suspensions, lineups):',
    newsBlock,
    '',
    'Based on all available information, produce a structured JSON prediction with:',
    '- winner: the predicted winner\'s name exactly as provided, or the string "Draw"',
    '- predictedScore: your best approximate final score as integers (home goals, away goals)',
    '- confidence: your overall confidence level (low | medium | high)',
    '- reasoning: 2-3 sentences explaining your prediction',
    '- warnings: list of notable risk factors e.g. key injuries, suspensions (empty array if none)',
  ].join('\n');
}
