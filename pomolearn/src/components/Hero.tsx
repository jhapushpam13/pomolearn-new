"use client";

import { motion } from "framer-motion";
import { Brain, Zap, Clock, BookOpen } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Generated Content",
    description: "Gemini AI creates tailored study material for your topic",
  },
  {
    icon: Clock,
    title: "Pomodoro Method",
    description: "Focused study sessions with structured breaks",
  },
  {
    icon: Zap,
    title: "Adaptive Quizzes",
    description: "Test your knowledge with auto-generated MCQs",
  },
  {
    icon: BookOpen,
    title: "Custom Sessions",
    description: "Configure cycles, duration, and quiz length",
  },
];

export function Hero() {
  return (
    <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-4 pt-16 pb-8 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, var(--color-primary-400), transparent 70%)",
          }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle, var(--color-accent-400), transparent 70%)",
          }}
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, var(--color-primary-300), transparent 60%)",
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm font-medium mb-6"
          style={{ color: "var(--text-secondary)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Zap className="w-4 h-4 text-accent-500" />
          Powered by Google Gemini AI
        </motion.div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
          <span className="gradient-text">Pomolearn</span>
        </h1>

        <motion.p
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-4 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Master any topic with AI-powered{" "}
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
            focused learning sessions
          </span>
          . Intelligent content generation meets the proven Pomodoro technique.
        </motion.p>

        <motion.p
          className="text-sm max-w-lg mx-auto mb-10"
          style={{ color: "var(--text-muted)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Enter your topic, customize your session, and let Gemini AI create a structured learning
          experience — complete with timed cycles and a knowledge quiz.
        </motion.p>
      </motion.div>

      {/* Feature cards */}
      <motion.div
        className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            className="glass rounded-xl p-4 text-center cursor-default"
            style={{ boxShadow: "var(--shadow-sm)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
            whileHover={{
              y: -4,
              boxShadow: "var(--shadow-glow)",
              transition: { duration: 0.2 },
            }}
          >
            <feature.icon
              className="w-7 h-7 mx-auto mb-2 text-primary-500"
              strokeWidth={1.5}
            />
            <h3
              className="font-heading text-sm font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {feature.title}
            </h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
