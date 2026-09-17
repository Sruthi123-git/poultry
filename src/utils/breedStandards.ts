import { BreedStandardPoint } from '../types';

// Standard 42-day broiler performance growth curves
export const VENCOBB_430_STANDARDS: BreedStandardPoint[] = [
  { ageDays: 1, expectedWeightGrams: 42, expectedDailyGainGrams: 12, expectedDailyFeedGrams: 15, expectedCumulativeFeedGrams: 15, expectedFCR: 0.36 },
  { ageDays: 2, expectedWeightGrams: 56, expectedDailyGainGrams: 14, expectedDailyFeedGrams: 18, expectedCumulativeFeedGrams: 33, expectedFCR: 0.59 },
  { ageDays: 3, expectedWeightGrams: 72, expectedDailyGainGrams: 16, expectedDailyFeedGrams: 22, expectedCumulativeFeedGrams: 55, expectedFCR: 0.76 },
  { ageDays: 4, expectedWeightGrams: 91, expectedDailyGainGrams: 19, expectedDailyFeedGrams: 26, expectedCumulativeFeedGrams: 81, expectedFCR: 0.89 },
  { ageDays: 5, expectedWeightGrams: 114, expectedDailyGainGrams: 23, expectedDailyFeedGrams: 31, expectedCumulativeFeedGrams: 112, expectedFCR: 0.98 },
  { ageDays: 6, expectedWeightGrams: 141, expectedDailyGainGrams: 27, expectedDailyFeedGrams: 36, expectedCumulativeFeedGrams: 148, expectedFCR: 1.05 },
  { ageDays: 7, expectedWeightGrams: 172, expectedDailyGainGrams: 31, expectedDailyFeedGrams: 42, expectedCumulativeFeedGrams: 190, expectedFCR: 1.10 },
  { ageDays: 8, expectedWeightGrams: 207, expectedDailyGainGrams: 35, expectedDailyFeedGrams: 48, expectedCumulativeFeedGrams: 238, expectedFCR: 1.15 },
  { ageDays: 9, expectedWeightGrams: 246, expectedDailyGainGrams: 39, expectedDailyFeedGrams: 54, expectedCumulativeFeedGrams: 292, expectedFCR: 1.19 },
  { ageDays: 10, expectedWeightGrams: 289, expectedDailyGainGrams: 43, expectedDailyFeedGrams: 61, expectedCumulativeFeedGrams: 353, expectedFCR: 1.22 },
  { ageDays: 11, expectedWeightGrams: 337, expectedDailyGainGrams: 48, expectedDailyFeedGrams: 68, expectedCumulativeFeedGrams: 421, expectedFCR: 1.25 },
  { ageDays: 12, expectedWeightGrams: 389, expectedDailyGainGrams: 52, expectedDailyFeedGrams: 75, expectedCumulativeFeedGrams: 496, expectedFCR: 1.28 },
  { ageDays: 13, expectedWeightGrams: 446, expectedDailyGainGrams: 57, expectedDailyFeedGrams: 82, expectedCumulativeFeedGrams: 578, expectedFCR: 1.30 },
  { ageDays: 14, expectedWeightGrams: 508, expectedDailyGainGrams: 62, expectedDailyFeedGrams: 90, expectedCumulativeFeedGrams: 668, expectedFCR: 1.31 },
  { ageDays: 15, expectedWeightGrams: 575, expectedDailyGainGrams: 67, expectedDailyFeedGrams: 97, expectedCumulativeFeedGrams: 765, expectedFCR: 1.33 },
  { ageDays: 16, expectedWeightGrams: 647, expectedDailyGainGrams: 72, expectedDailyFeedGrams: 105, expectedCumulativeFeedGrams: 870, expectedFCR: 1.34 },
  { ageDays: 17, expectedWeightGrams: 723, expectedDailyGainGrams: 76, expectedDailyFeedGrams: 112, expectedCumulativeFeedGrams: 982, expectedFCR: 1.36 },
  { ageDays: 18, expectedWeightGrams: 804, expectedDailyGainGrams: 81, expectedDailyFeedGrams: 119, expectedCumulativeFeedGrams: 1101, expectedFCR: 1.37 },
  { ageDays: 19, expectedWeightGrams: 889, expectedDailyGainGrams: 85, expectedDailyFeedGrams: 126, expectedCumulativeFeedGrams: 1227, expectedFCR: 1.38 },
  { ageDays: 20, expectedWeightGrams: 978, expectedDailyGainGrams: 89, expectedDailyFeedGrams: 132, expectedCumulativeFeedGrams: 1359, expectedFCR: 1.39 },
  { ageDays: 21, expectedWeightGrams: 1071, expectedDailyGainGrams: 93, expectedDailyFeedGrams: 138, expectedCumulativeFeedGrams: 1497, expectedFCR: 1.40 },
  { ageDays: 22, expectedWeightGrams: 1168, expectedDailyGainGrams: 97, expectedDailyFeedGrams: 144, expectedCumulativeFeedGrams: 1641, expectedFCR: 1.41 },
  { ageDays: 23, expectedWeightGrams: 1269, expectedDailyGainGrams: 101, expectedDailyFeedGrams: 150, expectedCumulativeFeedGrams: 1791, expectedFCR: 1.41 },
  { ageDays: 24, expectedWeightGrams: 1373, expectedDailyGainGrams: 104, expectedDailyFeedGrams: 155, expectedCumulativeFeedGrams: 1946, expectedFCR: 1.42 },
  { ageDays: 25, expectedWeightGrams: 1480, expectedDailyGainGrams: 107, expectedDailyFeedGrams: 160, expectedCumulativeFeedGrams: 2106, expectedFCR: 1.42 },
  { ageDays: 26, expectedWeightGrams: 1590, expectedDailyGainGrams: 110, expectedDailyFeedGrams: 165, expectedCumulativeFeedGrams: 2271, expectedFCR: 1.43 },
  { ageDays: 27, expectedWeightGrams: 1702, expectedDailyGainGrams: 112, expectedDailyFeedGrams: 170, expectedCumulativeFeedGrams: 2441, expectedFCR: 1.43 },
  { ageDays: 28, expectedWeightGrams: 1817, expectedDailyGainGrams: 115, expectedDailyFeedGrams: 174, expectedCumulativeFeedGrams: 2615, expectedFCR: 1.44 },
  { ageDays: 29, expectedWeightGrams: 1934, expectedDailyGainGrams: 117, expectedDailyFeedGrams: 178, expectedCumulativeFeedGrams: 2793, expectedFCR: 1.44 },
  { ageDays: 30, expectedWeightGrams: 2052, expectedDailyGainGrams: 118, expectedDailyFeedGrams: 182, expectedCumulativeFeedGrams: 2975, expectedFCR: 1.45 },
  { ageDays: 31, expectedWeightGrams: 2171, expectedDailyGainGrams: 119, expectedDailyFeedGrams: 186, expectedCumulativeFeedGrams: 3161, expectedFCR: 1.46 },
  { ageDays: 32, expectedWeightGrams: 2291, expectedDailyGainGrams: 120, expectedDailyFeedGrams: 189, expectedCumulativeFeedGrams: 3350, expectedFCR: 1.46 },
  { ageDays: 33, expectedWeightGrams: 2411, expectedDailyGainGrams: 120, expectedDailyFeedGrams: 192, expectedCumulativeFeedGrams: 3542, expectedFCR: 1.47 },
  { ageDays: 34, expectedWeightGrams: 2531, expectedDailyGainGrams: 120, expectedDailyFeedGrams: 195, expectedCumulativeFeedGrams: 3737, expectedFCR: 1.48 },
  { ageDays: 35, expectedWeightGrams: 2650, expectedDailyGainGrams: 119, expectedDailyFeedGrams: 197, expectedCumulativeFeedGrams: 3934, expectedFCR: 1.48 },
  { ageDays: 36, expectedWeightGrams: 2768, expectedDailyGainGrams: 118, expectedDailyFeedGrams: 199, expectedCumulativeFeedGrams: 4133, expectedFCR: 1.49 },
  { ageDays: 37, expectedWeightGrams: 2884, expectedDailyGainGrams: 116, expectedDailyFeedGrams: 201, expectedCumulativeFeedGrams: 4334, expectedFCR: 1.50 },
  { ageDays: 38, expectedWeightGrams: 2998, expectedDailyGainGrams: 114, expectedDailyFeedGrams: 203, expectedCumulativeFeedGrams: 4537, expectedFCR: 1.51 },
  { ageDays: 39, expectedWeightGrams: 3109, expectedDailyGainGrams: 111, expectedDailyFeedGrams: 204, expectedCumulativeFeedGrams: 4741, expectedFCR: 1.52 },
  { ageDays: 40, expectedWeightGrams: 3217, expectedDailyGainGrams: 108, expectedDailyFeedGrams: 205, expectedCumulativeFeedGrams: 4946, expectedFCR: 1.54 },
  { ageDays: 41, expectedWeightGrams: 3321, expectedDailyGainGrams: 104, expectedDailyFeedGrams: 206, expectedCumulativeFeedGrams: 5152, expectedFCR: 1.55 },
  { ageDays: 42, expectedWeightGrams: 3420, expectedDailyGainGrams: 99, expectedDailyFeedGrams: 206, expectedCumulativeFeedGrams: 5358, expectedFCR: 1.57 },
];

export const COBB_500_STANDARDS = VENCOBB_430_STANDARDS.map(p => ({
  ...p,
  expectedWeightGrams: Math.round(p.expectedWeightGrams * 1.02),
  expectedDailyFeedGrams: Math.round(p.expectedDailyFeedGrams * 1.015),
  expectedCumulativeFeedGrams: Math.round(p.expectedCumulativeFeedGrams * 1.015),
}));

export const ROSS_308_STANDARDS = VENCOBB_430_STANDARDS.map(p => ({
  ...p,
  expectedWeightGrams: Math.round(p.expectedWeightGrams * 0.99),
  expectedDailyFeedGrams: Math.round(p.expectedDailyFeedGrams * 0.995),
  expectedCumulativeFeedGrams: Math.round(p.expectedCumulativeFeedGrams * 0.995),
}));

export function getBreedStandards(breedName: string): BreedStandardPoint[] {
  if (breedName.toLowerCase().includes('cobb 500')) return COBB_500_STANDARDS;
  if (breedName.toLowerCase().includes('ross')) return ROSS_308_STANDARDS;
  return VENCOBB_430_STANDARDS;
}

export function getExpectedWeightForAge(ageDays: number, breedName: string = 'Vencobb 430'): number {
  const standards = getBreedStandards(breedName);
  const point = standards.find(s => s.ageDays === ageDays);
  if (point) return point.expectedWeightGrams;
  if (ageDays <= 0) return 42;
  if (ageDays > 42) {
    const last = standards[standards.length - 1];
    return Math.round(last.expectedWeightGrams + (ageDays - 42) * 85);
  }
  return 42 + ageDays * 70;
}
