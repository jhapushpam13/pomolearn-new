"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Hero } from "@/components/Hero";
import { ConfigConsole } from "@/components/ConfigConsole";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useSessionStore } from "@/store/useSessionStore";
import { useState } from "react";
import { AlertTriangle, Settings } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const {
    setTopic,
    setConfig,
    setCyclesContent,
    setPhase,
    setRateLimited,
    phase,
    rateLimited,
    settings,
  } = useSessionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async (
    topic: string,
    config: {
      cycles: number;
      workDuration: number;
      breakDuration: number;
      questionCount: number;
    }
  ) => {
    setIsLoading(true);
    setPhase("loading");
    setError("");
    setRateLimited(false);
    setTopic(topic);
    setConfig(config);

    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          cycles: config.cycles,
          ...(settings.apiKey ? { apiKey: settings.apiKey } : {}),
          ...(settings.model ? { model: settings.model } : {}),
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to parse error response" }));

        // Handle rate limiting specifically
        if (response.status === 429 || errorData.rateLimited) {
          setRateLimited(true);
          throw new Error(errorData.error || "Rate limit exceeded.");
        }

        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (
        !data.cycles ||
        !Array.isArray(data.cycles) ||
        data.cycles.length !== config.cycles
      ) {
        throw new Error(
          "Invalid or incomplete content received from the server."
        );
      }

      setCyclesContent(data.cycles);
      setPhase("learning");
      router.push("/learn");
    } catch (err: any) {
      console.error("Failed to fetch content:", err);
      setError(err.message || "Failed to load content. Please try again.");
      setPhase("landing");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {phase === "loading" && isLoading && <LoadingScreen />}
      </AnimatePresence>

      <div className="min-h-screen">
        <Hero />
        <ConfigConsole onStart={handleStart} isLoading={isLoading} />

        {/* Rate Limited Banner */}
        {rateLimited && (
          <motion.div
            className="max-w-2xl mx-auto px-4 -mt-4 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="glass rounded-2xl p-5 flex items-start gap-4"
              style={{
                borderLeft: "4px solid var(--color-accent-500)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <AlertTriangle
                className="w-6 h-6 text-accent-500 shrink-0 mt-0.5"
                strokeWidth={2}
              />
              <div>
                <p
                  className="font-heading font-bold text-sm mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  Your AI credits are exhausted
                </p>
                <p
                  className="text-sm mb-3"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Enter your own Gemini API key in{" "}
                  <strong>Settings</strong> (bottom-left) to continue
                  learning. Get a free key from{" "}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold text-primary-500"
                  >
                    Google AI Studio
                  </a>
                  .
                </p>
                <button
                  onClick={() => {
                    // Trigger settings panel open via a custom event
                    document.getElementById("settings-toggle")?.click();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold cursor-pointer text-white"
                  style={{
                    background: "var(--color-primary-500)",
                  }}
                >
                  <Settings className="w-4 h-4" />
                  Open Settings
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* General error */}
        {error && !rateLimited && (
          <motion.div
            className="max-w-2xl mx-auto px-4 -mt-4 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className="glass rounded-xl p-4 text-center"
              style={{
                borderColor: "var(--color-danger-300)",
                color: "var(--color-danger-600)",
              }}
            >
              <p className="text-sm font-medium">Error: {error}</p>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
