/**
 * Statistical Utility Functions
 * For data generation and analysis
 */

/**
 * Calculate mean (average) of an array of numbers
 */
export const mean = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
};

/**
 * Calculate standard deviation
 */
export const standardDeviation = (values: number[]): number => {
  if (values.length === 0) return 0;
  const avg = mean(values);
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
  return Math.sqrt(mean(squaredDiffs));
};

/**
 * Generate a random number from normal distribution using Box-Muller transform
 * @param mean - Mean of the distribution
 * @param stdDev - Standard deviation
 * @returns Random number from normal distribution
 */
export const normalDistribution = (mean: number, stdDev: number): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z * stdDev + mean;
};

/**
 * Calculate correlation between two arrays
 */
export const correlation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }

  if (denomX === 0 || denomY === 0) return 0;
  return numerator / Math.sqrt(denomX * denomY);
};


/**
 * Clamp value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Generate random integer between min and max (inclusive)
 */
export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Random choice from array
 */
export const randomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Random choices with weighted probabilities
 * @param options - Array of options
 * @param weights - Array of weights (must sum to 1)
 */
export const weightedChoice = <T>(options: T[], weights: number[]): T => {
  if (options.length !== weights.length) {
    throw new Error('Options and weights must have same length');
  }

  const random = Math.random();
  let cumulative = 0;

  for (let i = 0; i < options.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      return options[i];
    }
  }

  return options[options.length - 1];
};

/**
 * Seeded random number generator (for reproducible results)
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    // Linear congruential generator
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextNormal(mean: number, stdDev: number): number {
    const u1 = this.next();
    const u2 = this.next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z * stdDev + mean;
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}
