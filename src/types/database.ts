import { DbRelation, PredictionData } from './database-shared';

export type { Json, PredictionData } from './database-shared';

export interface Database {
  public: {
    Tables: {
      predictions: {
        Row: {
          id: string;
          user_id: string;
          match_id: string;
          home_team: string | null;
          away_team: string | null;
          match_date: string | null;
          prediction_data: PredictionData;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          match_id: string;
          home_team?: string | null;
          away_team?: string | null;
          match_date?: string | null;
          prediction_data: PredictionData;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          match_id?: string;
          home_team?: string | null;
          away_team?: string | null;
          match_date?: string | null;
          prediction_data?: PredictionData;
          created_at?: string;
        };
        Relationships: DbRelation[];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          match_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          match_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          match_id?: string;
          created_at?: string;
        };
        Relationships: DbRelation[];
      };
      match_history: {
        Row: {
          id: string;
          user_id: string;
          match_id: string;
          home_team: string | null;
          away_team: string | null;
          match_date: string | null;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          match_id: string;
          home_team?: string | null;
          away_team?: string | null;
          match_date?: string | null;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          match_id?: string;
          home_team?: string | null;
          away_team?: string | null;
          match_date?: string | null;
          viewed_at?: string;
        };
        Relationships: DbRelation[];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Prediction = Database['public']['Tables']['predictions']['Row'];
export type PredictionInsert =
  Database['public']['Tables']['predictions']['Insert'];
export type PredictionUpdate =
  Database['public']['Tables']['predictions']['Update'];

export type Favorite = Database['public']['Tables']['favorites']['Row'];
export type FavoriteInsert =
  Database['public']['Tables']['favorites']['Insert'];
export type FavoriteUpdate =
  Database['public']['Tables']['favorites']['Update'];

export type MatchHistory = Database['public']['Tables']['match_history']['Row'];
export type MatchHistoryInsert =
  Database['public']['Tables']['match_history']['Insert'];
export type MatchHistoryUpdate =
  Database['public']['Tables']['match_history']['Update'];
