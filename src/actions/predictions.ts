'use server';

import { verifySession } from '@/lib/dal';
import { createSupabaseServer } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type Prediction = Database['public']['Tables']['predictions']['Row'];
export type PredictionInsert =
  Database['public']['Tables']['predictions']['Insert'];

/**
 * Save a user's prediction for a match
 */
export async function savePrediction(
  matchId: string,
  predictionData: Database['public']['Tables']['predictions']['Insert']['prediction_data'],
  metadata?: {
    homeTeam?: string;
    awayTeam?: string;
    matchDate?: string;
  },
): Promise<Prediction | null> {
  const { isAuth, userId } = await verifySession();
  if (!isAuth || !userId) return null;

  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from('predictions')
    // @ts-expect-error - Types mismatch with manual Database definition but runtime is correct
    .insert({
      user_id: userId,
      match_id: matchId,
      prediction_data: predictionData,
      home_team: metadata?.homeTeam,
      away_team: metadata?.awayTeam,
      match_date: metadata?.matchDate,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving prediction:', error);
    return null;
  }

  return data;
}

/**
 * Get all predictions for the current user
 */
export async function getUserPredictions(): Promise<Prediction[]> {
  const { isAuth, userId } = await verifySession();
  if (!isAuth || !userId) return [];

  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching predictions:', error);
    return [];
  }

  return data;
}

/**
 * Delete a prediction by ID
 */
export async function deletePrediction(predictionId: string): Promise<boolean> {
  const { isAuth, userId } = await verifySession();
  if (!isAuth || !userId) return false;

  const supabase = await createSupabaseServer();

  const { error } = await supabase
    .from('predictions')
    .delete()
    .eq('id', predictionId)
    .eq('user_id', userId); // Extra safety check

  if (error) {
    console.error('Error deleting prediction:', error);
    return false;
  }

  return true;
}
