'use server';

import { verifySession } from '@/lib/dal';
import { createSupabaseServer } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type MatchHistory = Database['public']['Tables']['match_history']['Row'];

/**
 * Track that a user viewed a match
 */
export async function trackMatchView(
  matchId: string,
  metadata?: {
    homeTeam?: string;
    awayTeam?: string;
    matchDate?: string;
  },
): Promise<boolean> {
  const { isAuth, userId } = await verifySession();
  if (!isAuth || !userId) return false;

  const supabase = await createSupabaseServer();

  // Check if history already exists
  const { data: existing } = await supabase
    .from('match_history')
    .select('id')
    .eq('user_id', userId)
    .eq('match_id', matchId)
    .single();

  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from('match_history')
      // @ts-expect-error - Types mismatch with manual Database definition but runtime is correct
      .update({
        viewed_at: new Date().toISOString(),
        ...(metadata?.homeTeam ? { home_team: metadata.homeTeam } : {}),
        ...(metadata?.awayTeam ? { away_team: metadata.awayTeam } : {}),
        ...(metadata?.matchDate ? { match_date: metadata.matchDate } : {}),
      })
      // @ts-expect-error - Types mismatch with manual Database definition but runtime is correct
      .eq('id', existing.id);

    if (error) {
      console.error('Error updating match history:', error);
      return false;
    }
  } else {
    // Create new record
    // @ts-expect-error - Types mismatch with manual Database definition but runtime is correct
    const { error } = await supabase.from('match_history').insert({
      user_id: userId,
      match_id: matchId,
      viewed_at: new Date().toISOString(),
      home_team: metadata?.homeTeam,
      away_team: metadata?.awayTeam,
      match_date: metadata?.matchDate,
    });

    if (error) {
      console.error('Error creating match history:', error);
      return false;
    }
  }

  return true;
}

/**
 * Get match history for the current user
 */
export async function getUserHistory(): Promise<MatchHistory[]> {
  const { isAuth, userId } = await verifySession();
  if (!isAuth || !userId) return [];

  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from('match_history')
    .select('*')
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false });

  if (error) {
    console.error('Error fetching match history:', error);
    return [];
  }

  return data;
}

/**
 * Delete a match history entry by ID
 */
export async function deleteHistoryEntry(historyId: string): Promise<boolean> {
  const { isAuth, userId } = await verifySession();
  if (!isAuth || !userId) return false;

  const supabase = await createSupabaseServer();

  const { error } = await supabase
    .from('match_history')
    .delete()
    .eq('id', historyId)
    .eq('user_id', userId); // Extra safety check

  if (error) {
    console.error('Error deleting history entry:', error);
    return false;
  }

  return true;
}
