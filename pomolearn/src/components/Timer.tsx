"use client";

import { motion } from "framer-motion";
import type { TimerPhase } from "@/hooks/usePomodoroTimer";

interface TimerProps {
  timeRemaining: number;
  phase: TimerPhase;
  currentCycle: number;
  totalCycles: number;
  isRunning: boolean;
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
}

function formatTime(seconds: number): string {
  const mins = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.max(0, seconds) % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function Timer({
  timeRemaining,
  phase,
  currentCycle,
  totalCycles,
  isRunning,
  workDuration,
  breakDuration,
}: TimerProps) {
  const totalSeconds =
    phase === "break" ? breakDuration * 60 : workDuration * 60;
  const progress =
    totalSeconds > 0 ? (totalSeconds - timeRemaining) / totalSeconds : 0;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress);

  const isBreak = phase === "break";
  const isDone = phase === "done";

  const timerColor = isBreak
    ? "var(--color-success-400)"
    : "var(--color-primary-400)";
  const trackColor = isBreak
    ? "var(--color-success-200)"
    : "var(--color-primary-200)";

  const phaseLabel = isDone
    ? "Session Complete!"
    : isBreak
    ? "Break Time"
    : phase === "idle"
    ? "Ready"
    : "Work Time";

  return (
    <motion.div
      className="flex flex-col items-center gap-4 py-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Circular progress timer */}
      <div className="relative w-56 h-56">
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 200 200"
        >
          {/* Track */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={trackColor}
            strokeWidth="6"
            opacity="0.2"
          />
          {/* Progress */}
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={timerColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.5s linear" }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-5xl font-bold tracking-tight font-heading tabular-nums"
            style={{ color: timerColor }}
            key={timeRemaining}
          >
            {formatTime(timeRemaining)}
          </motion.span>
          <span
            className="text-xs font-medium mt-1 uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            {phaseLabel}
          </span>
        </div>
      </div>

      {/* Cycle indicator */}
      <div className="flex items-center gap-3">
        {Array.from({ length: totalCycles }, (_, i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full transition-all duration-300"
            style={{
              background:
                i + 1 < currentCycle || isDone
                  ? timerColor
                  : i + 1 === currentCycle
                  ? timerColor
                  : "var(--border-color)",
              opacity:
                i + 1 < currentCycle || isDone
                  ? 1
                  : i + 1 === currentCycle
                  ? 1
                  : 0.4,
              transform:
                i + 1 === currentCycle && !isDone
                  ? "scale(1.3)"
                  : "scale(1)",
            }}
            animate={
              i + 1 === currentCycle && isRunning
                ? { scale: [1.3, 1.5, 1.3] }
                : {}
            }
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        ))}
        <span
          className="text-sm font-medium ml-2"
          style={{ color: "var(--text-muted)" }}
        >
          Cycle {Math.min(currentCycle, totalCycles)}/{totalCycles}
        </span>
      </div>
    </motion.div>
  );
}
