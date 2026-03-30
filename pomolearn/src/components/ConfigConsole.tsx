"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  RotateCcw,
  Timer,
  Coffee,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface ConfigConsoleProps {
  onStart: (topic: string, config: {
    cycles: number;
    workDuration: number;
    breakDuration: number;
    questionCount: number;
  }) => void;
  isLoading?: boolean;
}

const cycleOptions = [1, 2, 3, 4, 5, 6, 7, 8];
const workOptions = [15, 20, 25, 30, 35, 40, 45, 50];
const breakOptions = [3, 5, 7, 10, 15];
const questionOptions = [5, 10, 15, 20, 25, 30, 35, 40];

export function ConfigConsole({ onStart, isLoading }: ConfigConsoleProps) {
  const [topic, setTopic] = useState("");
  const [cycles, setCycles] = useState(4);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [questionCount, setQuestionCount] = useState(25);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = topic.trim();
    if (!trimmed) {
      setError("Please enter a topic to learn about.");
      return;
    }
    setError("");
    onStart(trimmed, { cycles, workDuration, breakDuration, questionCount });
  };

  const configCards = [
    {
      icon: RotateCcw,
      label: "Learning Cycles",
      description: "Number of study sessions",
      value: cycles,
      onChange: setCycles,
      options: cycleOptions,
      suffix: cycles === 1 ? "cycle" : "cycles",
      color: "var(--color-primary-500)",
    },
    {
      icon: Timer,
      label: "Work Duration",
      description: "Minutes per cycle",
      value: workDuration,
      onChange: setWorkDuration,
      options: workOptions,
      suffix: "min",
      color: "var(--color-accent-500)",
    },
    {
      icon: Coffee,
      label: "Break Duration",
      description: "Minutes between cycles",
      value: breakDuration,
      onChange: setBreakDuration,
      options: breakOptions,
      suffix: "min",
      color: "var(--color-success-500)",
    },
    {
      icon: HelpCircle,
      label: "Quiz Questions",
      description: "Final quiz question count",
      value: questionCount,
      onChange: setQuestionCount,
      options: questionOptions,
      suffix: questionCount === 1 ? "question" : "questions",
      color: "var(--color-danger-500)",
    },
  ];

  return (
    <motion.section
      className="relative max-w-2xl mx-auto px-4 pb-16"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.6 }}
    >
      {/* Topic Input */}
      <div className="mb-8">
        <label
          htmlFor="topic-input"
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--text-secondary)" }}
        >
          What do you want to learn?
        </label>
        <div className="relative">
          <input
            id="topic-input"
            type="text"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading) handleSubmit();
            }}
            placeholder="e.g., Quantum Computing, JavaScript Promises, Photosynthesis..."
            className="w-full px-5 py-4 rounded-2xl glass text-base outline-none transition-all duration-300 focus:ring-2 focus:ring-primary-500/50 placeholder:opacity-50"
            style={{
              color: "var(--text-primary)",
              boxShadow: "var(--shadow-sm)",
              fontSize: "1rem",
            }}
            disabled={isLoading}
          />
          <Sparkles
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400 opacity-50"
            strokeWidth={1.5}
          />
        </div>
        {error && (
          <motion.p
            className="mt-2 text-sm text-danger-500 font-medium"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}
      </div>

      {/* Bento Grid Config */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {configCards.map((card, i) => (
          <motion.div
            key={card.label}
            className="glass rounded-2xl p-4 transition-all duration-200"
            style={{ boxShadow: "var(--shadow-sm)" }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 + i * 0.08, duration: 0.4 }}
            whileHover={{
              boxShadow: "var(--shadow-md)",
              transition: { duration: 0.2 },
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <card.icon
                className="w-4 h-4"
                style={{ color: card.color }}
                strokeWidth={2}
              />
              <span
                className="text-sm font-semibold font-heading"
                style={{ color: "var(--text-primary)" }}
              >
                {card.label}
              </span>
            </div>
            <p
              className="text-xs mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              {card.description}
            </p>
            <div className="flex items-center gap-2">
              <select
                value={card.value}
                onChange={(e) => card.onChange(Number(e.target.value))}
                className="flex-1 px-3 py-2 rounded-xl text-sm font-medium outline-none transition-all border cursor-pointer"
                style={{
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  borderColor: "var(--border-color)",
                }}
                disabled={isLoading}
              >
                {card.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span
                className="text-xs font-medium whitespace-nowrap"
                style={{ color: "var(--text-muted)" }}
              >
                {card.suffix}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Start Button */}
      <motion.button
        id="start-learning-btn"
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full py-4 rounded-2xl text-white font-heading font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          backgroundColor: isLoading ? "var(--color-surface-500)" : "transparent",
          backgroundImage: isLoading
            ? "none"
            : "linear-gradient(135deg, var(--color-primary-600), var(--color-primary-500), var(--color-accent-500))",
          backgroundSize: "200% 200%",
          boxShadow: isLoading ? "none" : "var(--shadow-glow)",
        }}
        whileHover={
          isLoading
            ? {}
            : {
                scale: 1.02,
                boxShadow: "0 0 40px rgba(92, 124, 250, 0.35)",
              }
        }
        whileTap={isLoading ? {} : { scale: 0.98 }}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            Start Learning Session
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </motion.button>
    </motion.section>
  );
}
