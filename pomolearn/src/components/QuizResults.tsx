"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, Trophy, RotateCcw } from "lucide-react";
import type { MCQ } from "@/store/useSessionStore";

interface QuizResultsProps {
  mcqs: MCQ[];
  userAnswers: Record<string, string | null>;
  score: number;
  onRestart: () => void;
}

export function QuizResults({
  mcqs,
  userAnswers,
  score,
  onRestart,
}: QuizResultsProps) {
  const percentage = mcqs.length > 0 ? Math.round((score / mcqs.length) * 100) : 0;

  const getScoreColor = () => {
    if (percentage >= 80) return "var(--color-success-500)";
    if (percentage >= 50) return "var(--color-accent-500)";
    return "var(--color-danger-500)";
  };

  const getScoreMessage = () => {
    if (percentage >= 90) return "Outstanding! 🎉";
    if (percentage >= 80) return "Great job! 🌟";
    if (percentage >= 60) return "Good effort! 💪";
    if (percentage >= 40) return "Keep learning! 📚";
    return "Let's try again! 🔄";
  };

  return (
    <motion.div
      className="max-w-3xl mx-auto px-4 pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Score Header */}
      <motion.div
        className="glass rounded-3xl p-8 text-center mb-8"
        style={{ boxShadow: "var(--shadow-lg)" }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.3,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
        >
          <Trophy
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: getScoreColor() }}
            strokeWidth={1.5}
          />
        </motion.div>

        <h2
          className="text-3xl font-heading font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Quiz Results
        </h2>

        <motion.div
          className="text-6xl font-heading font-extrabold my-4"
          style={{ color: getScoreColor() }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
        >
          {score}/{mcqs.length}
        </motion.div>

        <p
          className="text-lg font-medium mb-1"
          style={{ color: "var(--text-secondary)" }}
        >
          {percentage}% correct
        </p>
        <p className="text-xl">{getScoreMessage()}</p>
      </motion.div>

      {/* Answer details */}
      <div className="space-y-4 mb-8">
        {mcqs.map((mcq, index) => {
          const userAnswer = userAnswers[mcq.id];
          const isCorrect =
            userAnswer != null &&
            userAnswer.trim() === mcq.correctAnswer.trim();

          return (
            <motion.div
              key={mcq.id}
              className="glass rounded-2xl p-5 transition-all"
              style={{
                boxShadow: "var(--shadow-sm)",
                borderLeft: `4px solid ${
                  isCorrect
                    ? "var(--color-success-400)"
                    : "var(--color-danger-400)"
                }`,
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.04, duration: 0.3 }}
            >
              <div className="flex items-start gap-3 mb-3">
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-danger-500 mt-0.5 shrink-0" />
                )}
                <p
                  className="font-heading font-semibold text-sm leading-relaxed"
                  style={{ color: "var(--text-primary)" }}
                >
                  {index + 1}. {mcq.question}
                </p>
              </div>

              <div className="ml-8 space-y-1.5">
                <p className="text-sm">
                  <span style={{ color: "var(--text-muted)" }}>
                    Your answer:{" "}
                  </span>
                  <span
                    className="font-medium px-2 py-0.5 rounded-md inline-block"
                    style={{
                      background: isCorrect
                        ? "var(--color-success-100)"
                        : "var(--color-danger-100)",
                      color: isCorrect
                        ? "var(--color-success-800)"
                        : "var(--color-danger-800)",
                      textDecoration: isCorrect ? "none" : "line-through",
                    }}
                  >
                    {userAnswer ?? "Not answered"}
                  </span>
                </p>

                {!isCorrect && (
                  <p className="text-sm">
                    <span style={{ color: "var(--text-muted)" }}>
                      Correct answer:{" "}
                    </span>
                    <span
                      className="font-semibold px-2 py-0.5 rounded-md inline-block"
                      style={{
                        background: "var(--color-success-100)",
                        color: "var(--color-success-800)",
                      }}
                    >
                      {mcq.correctAnswer}
                    </span>
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Restart Button */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <motion.button
          id="restart-learning-btn"
          onClick={onRestart}
          className="px-8 py-4 rounded-2xl font-heading font-bold text-lg flex items-center justify-center gap-3 mx-auto text-white cursor-pointer"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary-600), var(--color-accent-500))",
            boxShadow: "var(--shadow-glow)",
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <RotateCcw className="w-5 h-5" />
          Learn Another Topic
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
