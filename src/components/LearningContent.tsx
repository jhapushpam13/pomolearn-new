"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Coffee } from "lucide-react";
import type { TimerPhase } from "@/hooks/usePomodoroTimer";

interface LearningContentProps {
  content: string;
  phase: TimerPhase;
  currentCycle: number;
  breakDuration: number;
}

export function LearningContent({
  content,
  phase,
  currentCycle,
  breakDuration,
}: LearningContentProps) {
  const isBreak = phase === "break";
  const isIdle = phase === "idle";
  const isDone = phase === "done";

  return (
    <motion.div
      className="glass rounded-2xl p-6 sm:p-8 max-h-[55vh] overflow-y-auto"
      style={{ boxShadow: "var(--shadow-md)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      {isBreak ? (
        <motion.div
          className="flex flex-col items-center justify-center py-12 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Coffee
              className="w-16 h-16 text-success-400 mb-4"
              strokeWidth={1.5}
            />
          </motion.div>
          <h3
            className="text-2xl font-heading font-bold mb-2"
            style={{ color: "var(--color-success-500)" }}
          >
            Break Time!
          </h3>
          <p style={{ color: "var(--text-secondary)" }}>
            Take a {breakDuration}-minute break. Stretch, relax, look away from
            the screen.
          </p>
        </motion.div>
      ) : isDone ? (
        <motion.div
          className="flex flex-col items-center justify-center py-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            Session complete. Preparing your quiz...
          </p>
        </motion.div>
      ) : isIdle && !content ? (
        <div className="text-center py-12">
          <p style={{ color: "var(--text-muted)" }}>
            Click <strong>&quot;Start Cycle {currentCycle}&quot;</strong> to begin.
          </p>
        </div>
      ) : (
        <motion.div
          key={`cycle-${currentCycle}`}
          className="prose prose-base max-w-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </motion.div>
      )}
    </motion.div>
  );
}
