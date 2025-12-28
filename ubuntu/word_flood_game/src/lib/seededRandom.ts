// Seeded pseudo-random number generator (Mulberry32)
// This allows us to generate the same sequence of "random" numbers given the same seed
// Used for daily challenges so all players get the same letter sequence

export class SeededRandom {
  private state: number;

  constructor(seed: string) {
    // Convert string seed to number using simple hash
    this.state = this.hashString(seed);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Ensure positive number
    return Math.abs(hash) || 1;
  }

  // Mulberry32 PRNG - fast and good distribution
  next(): number {
    let t = this.state += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  // Get random integer between min (inclusive) and max (exclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  // Pick random element from array
  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length)];
  }

  // Shuffle array (Fisher-Yates with seeded random)
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// Create a seeded random from today's date and language
export function createDailyRandom(seed: string): SeededRandom {
  return new SeededRandom(seed);
}
