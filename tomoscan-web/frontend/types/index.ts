export interface ProbabilityMap {
  unripe: number;
  ripe: number;
  overripe: number;
}

export interface ModelResult {
  prediction: "unripe" | "ripe" | "overripe";
  confidence: number;
  probabilities: ProbabilityMap;
  latency_ms: number;
}

export interface ScanResponse {
  id: string;
  image_filename: string;
  image_url: string | null;
  dt: ModelResult;
  rf: ModelResult;
  created_at: string;
}

export interface ScanListItem {
  id: string;
  image_filename: string;
  image_url: string | null;
  rf_prediction: string;
  rf_confidence: number;
  dt_prediction: string;
  dt_confidence: number;
  created_at: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: "member" | "admin";
  is_active: boolean;
  created_at: string;
}

export type MaturityLabel = "unripe" | "ripe" | "overripe";

export const MATURITY_COLOR: Record<MaturityLabel, string> = {
  unripe:   "#22c55e",
  ripe:     "#E8441A",
  overripe: "#92400e",
};

export const MATURITY_EMOJI: Record<MaturityLabel, string> = {
  unripe:   "🟢",
  ripe:     "🍅",
  overripe: "🟤",
};
