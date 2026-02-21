/**
 * @file src/lib/gemini.ts
 *
 * @description
 * **Executable Skill — @BackendExpert**
 *
 * Gemini 2.5 Flash integration for ScoreCast AI.
 * Provides AI-generated match predictions and analysis via the Google Generative AI SDK.
 *
 * Security contract:
 * - `GOOGLE_API_KEY` is accessed ONLY here via `process.env.GOOGLE_API_KEY`
 * - This file must NEVER be imported by any Client Component
 * - Keep under 150 lines — extract prompt builders to `src/lib/gemini.prompts.ts` if needed
 *
 * Dependencies:
 * - @google/generative-ai (install: `npm install @google/generative-ai`)
 *
 * @example
 * import { generatePrediction } from '@/lib/gemini';
 *
 * const prediction = await generatePrediction({
 *   homeTeam: 'Arsenal',
 *   awayTeam: 'Chelsea',
 *   odds: { home: 1.9, draw: 3.4, away: 4.1 },
 * });
 */

// TODO (@BackendExpert): Uncomment once @google/generative-ai is installed
// import { GoogleGenerativeAI } from '@google/generative-ai';

export interface PredictionInput {
  homeTeam: string;
  awayTeam: string;
  odds?: {
    home: number;
    draw: number;
    away: number;
  };
  recentNews?: string[];
}

/**
 * Generates a match prediction using Gemini 2.5 Flash.
 *
 * @param input - Match context including teams, odds, and recent news snippets.
 * @returns A promise resolving to a plain-text prediction string.
 */
export async function generatePrediction(
  input: PredictionInput,
): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error(
      '[gemini] GOOGLE_API_KEY is not set in environment variables.',
    );
  }

  // TODO (@BackendExpert): Replace stub with real Gemini SDK call
  // const genAI = new GoogleGenerativeAI(apiKey);
  // const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  //
  // const prompt = buildPredictionPrompt(input);
  // const result = await model.generateContent(prompt);
  // return result.response.text();

  // Stub — remove once SDK is wired up
  return `[STUB] Prediction for ${input.homeTeam} vs ${input.awayTeam} — implement generatePrediction().`;
}

/**
 * Builds the prompt string sent to Gemini.
 * Extracted here to keep generatePrediction() clean and testable.
 */
function buildPredictionPrompt(input: PredictionInput): string {
  const oddsLine = input.odds
    ? `Odds — Home: ${input.odds.home}, Draw: ${input.odds.draw}, Away: ${input.odds.away}.`
    : 'No odds data available.';

  const newsLine = input.recentNews?.length
    ? `Recent news: ${input.recentNews.join(' | ')}`
    : 'No recent news available.';

  return [
    `You are a football analyst. Predict the outcome of the match below.`,
    `Match: ${input.homeTeam} vs ${input.awayTeam}.`,
    oddsLine,
    newsLine,
    `Provide a concise prediction with confidence level (low/medium/high) and a brief reason.`,
  ].join('\n');
}
