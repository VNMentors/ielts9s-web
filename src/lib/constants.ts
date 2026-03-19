export const IELTS_SKILLS = ["Listening", "Reading"] as const;
export type IELTSSkill = (typeof IELTS_SKILLS)[number];

export const IELTS_SOURCES = ["Cambridge", "Actual Tests", "Forecast", "IELTS9s"] as const;
export type IELTSSource = (typeof IELTS_SOURCES)[number];

export const QUESTION_TYPES = [
  "Multiple Choice",
  "True/False/Not Given",
  "Gap Fill",
  "Matching Headings",
  "Matching Information",
  "Short Answer",
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const RANKS = [
  { id: "novice",  label: "Novice",  bandMin: 0,   bandMax: 3.5, level: "Root"  },
  { id: "scout",   label: "Scout",   bandMin: 4.0,  bandMax: 5.5, level: "Trunk" },
  { id: "knight",  label: "Knight",  bandMin: 6.0,  bandMax: 7.0, level: "Bud"   },
  { id: "master",  label: "Master",  bandMin: 7.5,  bandMax: 9.0, level: "Bloom" },
] as const;

// IELTS Raw Score → Band Score table
export const BAND_TABLE_40: Record<number, number> = {
  40: 9.0, 39: 8.5, 38: 8.0, 37: 7.5, 36: 7.5, 35: 7.0, 34: 6.5, 33: 6.5,
  32: 6.5, 31: 6.0, 30: 6.0, 29: 5.5, 28: 5.5, 27: 5.0, 26: 5.0, 25: 5.0,
  24: 5.0, 23: 4.5, 22: 4.0, 21: 4.0, 20: 4.0,
};

export function getBandScore(rawScore: number): number {
  return BAND_TABLE_40[rawScore] ?? 3.5;
}

export function getRankByBand(band: number) {
  return RANKS.find((r) => band >= r.bandMin && band <= r.bandMax) ?? RANKS[0];
}
