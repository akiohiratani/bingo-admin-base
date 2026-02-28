import { useEffect, useState } from "react";

const DRAW_LIMIT = 50;
const RECOVERY_INTERVAL_MS = 24 * 60 * 60 * 1000;
const STORAGE_KEY = "drawCounterState";

type DrawCounterState = {
  drawCount: number;
  lastRecoveryAt: number;
};

type UseDrawCounterResult = {
  drawCount: number;
  drawLimit: number;
  hasReachedLimit: boolean;
  incrementDrawCount: () => void;
};

class DrawCounterService {
  private static instance: DrawCounterService;
  private state: DrawCounterState = {
    drawCount: 0,
    lastRecoveryAt: Date.now(),
  };
  private listeners = new Set<() => void>();

  private constructor() {
    this.loadState();
    this.applyRecovery();
  }

  static getInstance(): DrawCounterService {
    if (!DrawCounterService.instance) {
      DrawCounterService.instance = new DrawCounterService();
    }
    return DrawCounterService.instance;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  increment(): void {
    this.applyRecovery();
    if (this.state.drawCount >= DRAW_LIMIT) {
      return;
    }
    this.state = {
      ...this.state,
      drawCount: this.state.drawCount + 1,
    };
    this.saveState();
    this.notify();
  }

  getState(): DrawCounterState {
    this.applyRecovery();
    return this.state;
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  private applyRecovery(): void {
    const now = Date.now();
    const elapsedIntervals = Math.floor(
      (now - this.state.lastRecoveryAt) / RECOVERY_INTERVAL_MS
    );

    if (elapsedIntervals <= 0) {
      return;
    }

    const recoveredCount = Math.min(this.state.drawCount, elapsedIntervals);
    if (recoveredCount === 0) {
      this.state = {
        ...this.state,
        lastRecoveryAt: now,
      };
      this.saveState();
      return;
    }

    this.state = {
      drawCount: this.state.drawCount - recoveredCount,
      lastRecoveryAt: this.state.lastRecoveryAt +
        recoveredCount * RECOVERY_INTERVAL_MS,
    };
    this.saveState();
    this.notify();
  }

  private loadState(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<DrawCounterState>;
        this.state = {
          drawCount: parsed.drawCount ?? 0,
          lastRecoveryAt: parsed.lastRecoveryAt ?? Date.now(),
        };
      }
    } catch (error) {
      console.warn("Failed to load draw counter state", error);
      this.state = {
        drawCount: 0,
        lastRecoveryAt: Date.now(),
      };
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.warn("Failed to save draw counter state", error);
    }
  }
}

const drawCounterService = DrawCounterService.getInstance();

export const useDrawCounter = (): UseDrawCounterResult => {
  const [state, setState] = useState<DrawCounterState>(
    drawCounterService.getState()
  );

  useEffect(() => {
    const unsubscribe = drawCounterService.subscribe(() => {
      setState(drawCounterService.getState());
    });

    const recoveryCheckTimer = window.setInterval(() => {
      setState(drawCounterService.getState());
    }, RECOVERY_INTERVAL_MS / 12);

    return () => {
      unsubscribe();
      window.clearInterval(recoveryCheckTimer);
    };
  }, []);

  return {
    drawCount: state.drawCount,
    drawLimit: DRAW_LIMIT,
    hasReachedLimit: state.drawCount >= DRAW_LIMIT,
    incrementDrawCount: () => drawCounterService.increment(),
  };
};

export const DRAW_COUNT_LIMIT = DRAW_LIMIT;
