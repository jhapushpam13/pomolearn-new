"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Send } from "lucide-react";
import { useSessionStore } from "@/store/useSessionStore";
import { usePomodoroTimer } from "@/hooks/usePomodoroTimer";
import { Timer } from "@/components/Timer";
import { TimerControls } from "@/components/TimerControls";
import { LearningContent } from "@/components/LearningContent";
import { LoadingScreen } from "@/components/LoadingScreen";
import { QuizCard } from "@/components/QuizCard";
import { QuizResults } from "@/components/QuizResults";

export default function LearnPage() {
  const router = useRouter();
  const {
    topic,
    config,
    cyclesContent,
    mcqs,
    userAnswers,
    score,
    phase,
    settings,
    setPhase,
    setMcqs,
    setUserAnswer,
    setScore,
    reset,
  } = useSessionStore();

  const [quizError, setQuizError] = useState("");

  // Redirect if no content loaded
  useEffect(() => {
    if (cyclesContent.length === 0 && phase !== "loading") {
      router.replace("/");
    }
  }, [cyclesContent, phase, router]);

  const handleSessionComplete = useCallback(async () => {
    // Generate quiz
    setPhase("quiz-loading");

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: cyclesContent,
          questionCount: config.questionCount,
          ...(settings.apiKey ? { apiKey: settings.apiKey } : {}),
          ...(settings.model ? { model: settings.model } : {}),
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to parse error response" }));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (
        !data.mcqs ||
        !Array.isArray(data.mcqs) ||
        data.mcqs.length === 0
      ) {
        throw new Error("Invalid quiz data received.");
      }

      setMcqs(data.mcqs);
      setPhase("quiz");
    } catch (err: any) {
      console.error("Failed to generate quiz:", err);
      setQuizError(err.message || "Failed to generate quiz.");
      setPhase("quiz");
    }
  }, [cyclesContent, config.questionCount, setPhase, setMcqs]);

  const timer = usePomodoroTimer({
    workDuration: config.workDuration,
    breakDuration: config.breakDuration,
    totalCycles: config.cycles,
    onSessionComplete: handleSessionComplete,
  });

  const handleQuizSubmit = () => {
    if (mcqs.length === 0) return;

    // Check all answered
    const allAnswered = mcqs.every(
      (mcq) => userAnswers[mcq.id] != null
    );
    if (!allAnswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    // Calculate score
    let calculatedScore = 0;
    mcqs.forEach((mcq) => {
      const userAnswer = userAnswers[mcq.id];
      if (
        userAnswer != null &&
        userAnswer.trim() === mcq.correctAnswer.trim()
      ) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);
    setPhase("results");
  };

  const handleRestart = () => {
    reset();
    router.replace("/");
  };

  const handleReset = () => {
    if (window.confirm("Reset session and return to home?")) {
      handleRestart();
    }
  };

  // Get current cycle content
  const currentContent =
    cyclesContent[timer.currentCycle - 1] || "";

  if (cyclesContent.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen pb-8">
      <AnimatePresence>
        {phase === "quiz-loading" && <LoadingScreen />}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        className="sticky top-0 z-30 glass px-4 py-3"
        style={{ boxShadow: "var(--shadow-sm)" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen
              className="w-5 h-5 text-primary-500"
              strokeWidth={1.5}
            />
            <span
              className="font-heading font-bold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              Pomolearn
            </span>
          </div>
          <h1
            className="text-sm font-medium truncate max-w-md"
            style={{ color: "var(--text-secondary)" }}
          >
            Learning: {topic}
          </h1>
        </div>
      </motion.header>

      <div className="max-w-4xl mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          {/* Learning Phase */}
          {(phase === "learning" || phase === "quiz-loading") &&
            timer.phase !== "done" && (
              <motion.div
                key="learning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Timer
                  timeRemaining={timer.timeRemaining}
                  phase={timer.phase}
                  currentCycle={timer.currentCycle}
                  totalCycles={timer.totalCycles}
                  isRunning={timer.isRunning}
                  workDuration={config.workDuration}
                  breakDuration={config.breakDuration}
                />

                <TimerControls
                  isRunning={timer.isRunning}
                  phase={timer.phase}
                  currentCycle={timer.currentCycle}
                  onToggle={timer.toggle}
                  onSkipToBreak={timer.skipToBreak}
                  onSkipBreak={timer.skipBreak}
                  onReset={handleReset}
                />

                <LearningContent
                  content={currentContent}
                  phase={timer.phase}
                  currentCycle={timer.currentCycle}
                  breakDuration={config.breakDuration}
                />
              </motion.div>
            )}

          {/* Quiz Phase */}
          {phase === "quiz" && mcqs.length > 0 && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2
                  className="text-3xl font-heading font-bold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Quiz Time! 🧠
                </h2>
                <p style={{ color: "var(--text-secondary)" }}>
                  Test your knowledge based on the material covered.
                </p>
              </motion.div>

              <div className="space-y-4 mb-8">
                {mcqs.map((mcq, index) => (
                  <QuizCard
                    key={mcq.id}
                    mcq={mcq}
                    index={index}
                    selectedAnswer={userAnswers[mcq.id] || null}
                    onSelect={setUserAnswer}
                  />
                ))}
              </div>

              <motion.div
                className="text-center pb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  id="submit-quiz-btn"
                  onClick={handleQuizSubmit}
                  className="px-8 py-4 rounded-2xl font-heading font-bold text-lg flex items-center justify-center gap-3 mx-auto text-white cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-primary-600), var(--color-accent-500))",
                    boxShadow: "var(--shadow-glow)",
                  }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Send className="w-5 h-5" />
                  Submit Answers
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Quiz Error */}
          {phase === "quiz" && mcqs.length === 0 && quizError && (
            <motion.div
              key="quiz-error"
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-danger-500 font-medium mb-4">
                Error: {quizError}
              </p>
              <button
                onClick={handleRestart}
                className="px-6 py-3 rounded-xl font-heading font-semibold text-white cursor-pointer"
                style={{
                  background: "var(--color-primary-500)",
                }}
              >
                Return Home
              </button>
            </motion.div>
          )}

          {/* Results Phase */}
          {phase === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <QuizResults
                mcqs={mcqs}
                userAnswers={userAnswers}
                score={score}
                onRestart={handleRestart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
