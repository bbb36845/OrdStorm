import { useCallback } from 'react';
import confetti from 'canvas-confetti';

// Confetti celebration effects for OrdStorm
export const useConfetti = () => {
  // Basic confetti burst for valid words
  const celebrateWord = useCallback((wordLength: number) => {
    const intensity = Math.min(wordLength * 20, 100); // More confetti for longer words

    confetti({
      particleCount: intensity,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#667eea', '#764ba2', '#fbbf24', '#34d399', '#f472b6'],
      ticks: 200,
      gravity: 1.2,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['circle', 'square'],
    });
  }, []);

  // Big celebration for long words (5+ letters)
  const celebrateLongWord = useCallback(() => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#fbbf24', '#f59e0b', '#d97706'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#667eea', '#764ba2', '#8b5cf6'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  // Game over celebration
  const celebrateGameOver = useCallback((score: number) => {
    if (score === 0) return;

    // Fireworks effect
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#667eea', '#764ba2', '#fbbf24'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#34d399', '#10b981', '#059669'],
      });
    }, 250);
  }, []);

  // Star burst for bonus letters
  const celebrateBonus = useCallback(() => {
    confetti({
      particleCount: 40,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#fcd34d', '#fbbf24', '#f59e0b', '#ffffff'],
      shapes: ['star'],
      scalar: 1.2,
    });
  }, []);

  return {
    celebrateWord,
    celebrateLongWord,
    celebrateGameOver,
    celebrateBonus,
  };
};

export default useConfetti;
