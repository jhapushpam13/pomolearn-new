"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { MCQ } from "@/store/useSessionStore";

interface QuizCardProps {
  mcq: MCQ;
  index: number;
  selectedAnswer: string | null;
  onSelect: (questionId: string, answer: string) => void;
  disabled?: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function QuizCard({
  mcq,
  index,
  selectedAnswer,
  onSelect,
  disabled,
}: QuizCardProps) {
  const shuffledOptions = useMemo(
    () => shuffleArray(mcq.options),
    [mcq.options]
  );

  return (
    <motion.div
      className="glass rounded-2xl p-5 sm:p-6"
      style={{ boxShadow: "var(--shadow-sm)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <p
        className="font-heading font-semibold text-base sm:text-lg mb-4 leading-relaxed"
        style={{ color: "var(--text-primary)" }}
      >
        <span className="text-primary-500 mr-2">{index + 1}.</span>
        {mcq.question}
      </p>

      <div className="grid gap-2">
        {shuffledOptions.map((option, optIdx) => {
          const isSelected = selectedAnswer === option;
          const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

          return (
            <motion.button
              key={option}
              onClick={() => !disabled && onSelect(mcq.id, option)}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3 cursor-pointer"
              style={{
                background: isSelected
                  ? "var(--color-primary-500)"
                  : "var(--bg-secondary)",
                color: isSelected ? "white" : "var(--text-primary)",
                border: `1px solid ${
                  isSelected
                    ? "var(--color-primary-500)"
                    : "var(--border-color)"
                }`,
              }}
              whileHover={
                disabled
                  ? {}
                  : {
                      scale: 1.01,
                      boxShadow: "var(--shadow-sm)",
                    }
              }
              whileTap={disabled ? {} : { scale: 0.99 }}
              disabled={disabled}
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: isSelected
                    ? "rgba(255,255,255,0.2)"
                    : "var(--border-color)",
                  color: isSelected ? "white" : "var(--text-muted)",
                }}
              >
                {letter}
              </span>
              {option}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
