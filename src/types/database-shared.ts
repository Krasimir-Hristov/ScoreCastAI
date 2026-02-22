export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface PredictionData {
  outcome: 'home' | 'draw' | 'away';
  confidence: 'low' | 'medium' | 'high';
  reasoning: string;
}

export type DbRelation = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};
