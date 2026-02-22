'use server';

import { verifySession } from '@/lib/dal';
import { createSupabaseServer } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type Favorite = Database['public']['Tables']['favorites']['Row'];

/**
 * Add a match to user's favorites
 */
export async function addFavorite(matchId: string): Promise<Favorite | null> {
  const { isAuth, userId } = await verifySession();
  if (!isAuth || !userId) return null;

  const supabase = await createSupabaseServer();

  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .eq('match_id', matchId)
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      match_id: matchId,
    } as any)
    .select()
    .single();

  if (error) {
    console.error('Error adding favorite:', error);
    return null;
  }

  return data;
}

/**
 * Remove a match from user's favorites
 */
export async function removeFavorite(matchId: string): Promise<boolean> {
  const { isAuth, userId } = await verifySession();
  if (!isAuth || !userId) return false;

  const supabase = await createSupabaseServer();

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('match_id', matchId);

  if (error) {
    console.error('Error removing favorite:', error);
    return false;
  }

  return true;
}

/**
 * Get all favorites for the current user
 */
export async function getUserFavorites(): Promise<Favorite[]> {
  const { isAuth, userId } = await verifySession();
  if (!isAuth || !userId) return [];

  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }

  return data;
}
