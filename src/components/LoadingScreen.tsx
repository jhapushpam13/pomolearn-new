"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const loadingMessages = [
  "Structuring your curriculum...",
  "Generating cycle content...",
  "Preparing your study material...",
  "Consulting our AI tutor...",
  "Building your learning path...",
  "Curating knowledge...",
];

export function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center"
      style={{ background: "var(--bg-primary)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, var(--color-primary-400), transparent 70%)",
          }}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle, var(--color-accent-400), transparent 70%)",
          }}
          animate={{
            x: [0, -40, 20, 0],
            y: [0, 30, -50, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Main loader */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Tomato / Pomodoro shape */}
        <motion.div
          className="relative w-32 h-32 mb-10"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, var(--color-primary-500), var(--color-accent-500), var(--color-primary-500))",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          {/* Inner circle */}
          <div
            className="absolute inset-2 rounded-full flex items-center justify-center"
            style={{ background: "var(--bg-primary)" }}
          >
            <motion.div
              className="w-16 h-16 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-danger-400), var(--color-accent-500))",
              }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>

        {/* Dynamic text */}
        <div className="h-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              className="text-lg font-medium font-heading"
              style={{ color: "var(--text-secondary)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {loadingMessages[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--color-primary-500)" }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.1, 0.8],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
