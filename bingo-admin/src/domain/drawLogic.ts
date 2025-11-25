// Business logic related to draw operations
// Provides pure functions for calculating remaining numbers and selecting next draw.
export const MAX_INDEX = 18;

// Calculate the list of numbers that have not been drawn yet.
export const createRemainingNumbers = (drawnNumbers: number[]): number[] => {
  return Array.from({ length: MAX_INDEX }, (_, i) => i + 1).filter(
    (number) => !drawnNumbers.includes(number)
  );
};

// Pick a random number from the remaining pool. Returns null when exhausted.
export const pickNextNumber = (drawnNumbers: number[]): number | null => {
  const remainingNumbers = createRemainingNumbers(drawnNumbers);
  if (remainingNumbers.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * remainingNumbers.length);
  return remainingNumbers[randomIndex];
};

// Calculate how many numbers are still available to draw.
export const calculateRemainingCount = (drawnNumbers: number[]): number =>
  MAX_INDEX - drawnNumbers.length;
