"use client";

import { motion } from "framer-motion";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
} from "lucide-react";
import type { TimerPhase } from "@/hooks/usePomodoroTimer";

interface TimerControlsProps {
  isRunning: boolean;
  phase: TimerPhase;
  currentCycle: number;
  onToggle: () => void;
  onSkipToBreak: () => void;
  onSkipBreak: () => void;
  onReset: () => void;
}

export function TimerControls({
  isRunning,
  phase,
  currentCycle,
  onToggle,
  onSkipToBreak,
  onSkipBreak,
  onReset,
}: TimerControlsProps) {
  const isDone = phase === "done";
  const isBreak = phase === "break";
  const isIdle = phase === "idle";
  const isWork = phase === "work";

  const getMainButtonLabel = () => {
    if (isDone) return "Session Done";
    if (isRunning) return "Pause";
    if (isIdle) return `Start Cycle ${currentCycle}`;
    if (isBreak) return "Resume Break";
    return "Resume";
  };

  const getMainButtonIcon = () => {
    if (isDone) return null;
    if (isRunning) return Pause;
    return Play;
  };

  const MainIcon = getMainButtonIcon();

  return (
    <motion.div
      className="flex flex-wrap items-center justify-center gap-3 py-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      {/* Main Start/Pause Button */}
      <motion.button
        id="start-pause-btn"
        onClick={onToggle}
        disabled={isDone}
        className="px-6 py-3 rounded-xl font-heading font-semibold text-sm flex items-center gap-2 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        style={{
          background: isDone
            ? "var(--color-surface-500)"
            : isRunning
            ? "var(--color-accent-500)"
            : "var(--color-primary-500)",
          boxShadow: isDone ? "none" : "var(--shadow-sm)",
        }}
        whileHover={isDone ? {} : { scale: 1.04 }}
        whileTap={isDone ? {} : { scale: 0.96 }}
      >
        {MainIcon && <MainIcon className="w-4 h-4" />}
        {getMainButtonLabel()}
      </motion.button>

      {/* Skip to Break (shown during work) */}
      {(isWork) && isRunning && (
        <motion.button
          id="skip-to-break-btn"
          onClick={onSkipToBreak}
          className="px-4 py-3 rounded-xl font-heading font-medium text-sm flex items-center gap-2 cursor-pointer transition-all glass"
          style={{
            color: "var(--color-success-600)",
            boxShadow: "var(--shadow-sm)",
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <SkipForward className="w-4 h-4" />
          Skip to Break
        </motion.button>
      )}

      {/* Skip Break (shown during break) */}
      {isBreak && isRunning && (
        <motion.button
          id="skip-break-btn"
          onClick={onSkipBreak}
          className="px-4 py-3 rounded-xl font-heading font-medium text-sm flex items-center gap-2 cursor-pointer transition-all glass"
          style={{
            color: "var(--color-primary-600)",
            boxShadow: "var(--shadow-sm)",
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <SkipForward className="w-4 h-4" />
          Skip Break
        </motion.button>
      )}

      {/* Reset Button */}
      <motion.button
        id="reset-btn"
        onClick={onReset}
        className="px-4 py-3 rounded-xl font-heading font-medium text-sm flex items-center gap-2 cursor-pointer transition-all"
        style={{
          background: "var(--color-danger-100)",
          color: "var(--color-danger-700)",
          boxShadow: "var(--shadow-sm)",
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        <RotateCcw className="w-4 h-4" />
        Reset
      </motion.button>
    </motion.div>
  );
}
