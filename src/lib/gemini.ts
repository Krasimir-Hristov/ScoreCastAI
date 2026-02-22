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

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { buildPredictionPrompt } from '@/lib/gemini.prompts';

// Expanded schema: winner, predicted score, confidence, reasoning, warnings
const PredictionOutputSchema = z.object({
  winner: z.string(),
  predictedScore: z.object({ home: z.number(), away: z.number() }),
  confidence: z.enum(['low', 'medium', 'high']),
  reasoning: z.string(),
  warnings: z.array(z.string()),
});

export type PredictionOutput = z.infer<typeof PredictionOutputSchema>;

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
 * Generates a match prediction using Gemini 2.5 Flash with JSON mode.
 *
 * @param input - Match context including teams, odds, and recent news snippets.
 * @returns A promise resolving to a structured prediction object.
 */
export async function generatePrediction(
  input: PredictionInput,
): Promise<PredictionOutput | null> {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.warn('[gemini] GOOGLE_API_KEY is not set.');
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        // Cast the literal JSON schema to any to satisfy the library's SchemaType.
        // The runtime will still receive a proper JSON schema object.
        responseSchema: {
          type: 'object',
          properties: {
            winner: { type: 'string' },
            predictedScore: {
              type: 'object',
              properties: {
                home: { type: 'number' },
                away: { type: 'number' },
              },
              required: ['home', 'away'],
            },
            confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
            reasoning: { type: 'string' },
            warnings: { type: 'array', items: { type: 'string' } },
          },
          required: [
            'winner',
            'predictedScore',
            'confidence',
            'reasoning',
            'warnings',
          ],
        } as unknown as any,
      },
    });

    const prompt = buildPredictionPrompt(input);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const json = JSON.parse(text);
    const parsed = PredictionOutputSchema.safeParse(json);

    return parsed.success ? parsed.data : null;
  } catch (error) {
    console.warn('[gemini] prediction error:', error);
    return null;
  }
}
