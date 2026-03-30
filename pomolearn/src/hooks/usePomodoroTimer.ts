"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type TimerPhase = "idle" | "work" | "break" | "done";

interface UsePomodoroTimerProps {
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  totalCycles: number;
  onCycleComplete?: (cycle: number) => void;
  onBreakComplete?: (nextCycle: number) => void;
  onSessionComplete?: () => void;
}

interface PomodoroTimerReturn {
  timeRemaining: number; // in seconds
  isRunning: boolean;
  currentCycle: number;
  phase: TimerPhase;
  totalCycles: number;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  skipToBreak: () => void;
  skipBreak: () => void;
  reset: () => void;
}

export function usePomodoroTimer({
  workDuration,
  breakDuration,
  totalCycles,
  onCycleComplete,
  onBreakComplete,
  onSessionComplete,
}: UsePomodoroTimerProps): PomodoroTimerReturn {
  const workSeconds = workDuration * 60;
  const breakSeconds = breakDuration * 60;

  const [timeRemaining, setTimeRemaining] = useState(workSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [phase, setPhase] = useState<TimerPhase>("idle");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeRef = useRef(workSeconds);
  const phaseRef = useRef<TimerPhase>("idle");
  const cycleRef = useRef(1);

  // Keep refs in sync
  useEffect(() => {
    timeRef.current = timeRemaining;
  }, [timeRemaining]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    cycleRef.current = currentCycle;
  }, [currentCycle]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleCycleCompletion = useCallback(() => {
    clearTimer();
    setIsRunning(false);

    const currentPhase = phaseRef.current;
    const cycle = cycleRef.current;

    if (currentPhase === "break") {
      // Break finished
      const nextCycle = cycle + 1;

      if (nextCycle > totalCycles) {
        // All cycles done
        setPhase("done");
        setTimeRemaining(0);
        onSessionComplete?.();
      } else {
        // Setup next work cycle
        setCurrentCycle(nextCycle);
        setPhase("idle");
        setTimeRemaining(workSeconds);
        onBreakComplete?.(nextCycle);
      }
    } else if (currentPhase === "work") {
      // Work cycle finished
      if (cycle >= totalCycles) {
        // Last work cycle done - go to quiz
        setPhase("done");
        setTimeRemaining(0);
        onSessionComplete?.();
      } else {
        // Start break
        onCycleComplete?.(cycle);
        setPhase("break");
        setTimeRemaining(breakSeconds);
        // Auto-start break
        setTimeout(() => {
          startBreakTimer();
        }, 100);
      }
    }
  }, [totalCycles, workSeconds, breakSeconds, clearTimer, onCycleComplete, onBreakComplete, onSessionComplete]);

  const startBreakTimer = useCallback(() => {
    clearTimer();
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleCycleCompletion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, handleCycleCompletion]);

  const start = useCallback(() => {
    if (phaseRef.current === "done") return;

    clearTimer();

    if (phaseRef.current === "idle" || phaseRef.current === "work") {
      setPhase("work");
    }

    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleCycleCompletion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, handleCycleCompletion]);

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const toggle = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }, [isRunning, pause, start]);

  const skipToBreak = useCallback(() => {
    if (phaseRef.current !== "work") return;
    clearTimer();
    setIsRunning(false);
    setTimeRemaining(0);

    const cycle = cycleRef.current;

    if (cycle >= totalCycles) {
      // Last cycle - go to done
      setPhase("done");
      onSessionComplete?.();
    } else {
      onCycleComplete?.(cycle);
      setPhase("break");
      setTimeRemaining(breakSeconds);
      setTimeout(() => {
        startBreakTimer();
      }, 100);
    }
  }, [totalCycles, breakSeconds, clearTimer, onCycleComplete, onSessionComplete, startBreakTimer]);

  const skipBreak = useCallback(() => {
    if (phaseRef.current !== "break") return;
    clearTimer();
    setIsRunning(false);

    const nextCycle = cycleRef.current + 1;

    if (nextCycle > totalCycles) {
      setPhase("done");
      setTimeRemaining(0);
      onSessionComplete?.();
    } else {
      setCurrentCycle(nextCycle);
      setPhase("idle");
      setTimeRemaining(workSeconds);
      onBreakComplete?.(nextCycle);
    }
  }, [totalCycles, workSeconds, clearTimer, onBreakComplete, onSessionComplete]);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setCurrentCycle(1);
    setPhase("idle");
    setTimeRemaining(workSeconds);
  }, [clearTimer, workSeconds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    timeRemaining,
    isRunning,
    currentCycle,
    phase,
    totalCycles,
    start,
    pause,
    toggle,
    skipToBreak,
    skipBreak,
    reset,
  };
}
