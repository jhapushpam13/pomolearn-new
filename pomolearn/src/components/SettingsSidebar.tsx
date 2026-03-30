"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Key, Cpu, ChevronRight, Check } from "lucide-react";
import { useSessionStore } from "@/store/useSessionStore";

const AVAILABLE_MODELS = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
];

export function SettingsSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, setSettings } = useSessionStore();
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSettings({ apiKey: apiKey.trim(), model });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setApiKey("");
    setModel("gemini-2.5-flash");
    setSettings({ apiKey: "", model: "gemini-2.5-flash" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        id="settings-toggle"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 left-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full glass cursor-pointer transition-all"
        style={{ boxShadow: "var(--shadow-md)" }}
        whileHover={{ scale: 1.05, x: 3 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open Settings"
      >
        <Settings className="w-4 h-4 text-primary-500" strokeWidth={2} />
        <span
          className="text-sm font-heading font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Settings
        </span>
        {settings.apiKey && (
          <span className="w-2 h-2 rounded-full bg-success-500" title="Custom API key active" />
        )}
        <ChevronRight className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-0 left-0 z-50 w-full sm:w-[400px] max-h-[85vh] rounded-t-3xl sm:rounded-tr-3xl sm:rounded-tl-none sm:bottom-0 sm:left-0 overflow-y-auto"
            style={{
              background: "var(--bg-card)",
              boxShadow: "var(--shadow-lg)",
              borderTop: "1px solid var(--border-color)",
              borderRight: "1px solid var(--border-color)",
            }}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "var(--border-color)" }}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary-500" />
                <h2
                  className="font-heading font-bold text-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  Settings
                </h2>
              </div>
              <motion.button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl cursor-pointer transition-colors"
                style={{ background: "var(--bg-secondary)" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Info banner */}
              <div
                className="rounded-xl p-4 text-sm"
                style={{
                  background: "var(--color-primary-50)",
                  color: "var(--color-primary-800)",
                  border: "1px solid var(--color-primary-200)",
                }}
              >
                <p className="font-medium mb-1">🔑 Custom API Key</p>
                <p className="opacity-80 text-xs leading-relaxed">
                  Add your own Gemini API key to bypass the free usage limit.
                  Get a key from{" "}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold"
                  >
                    Google AI Studio
                  </a>
                  .
                </p>
              </div>

              {/* API Key Input */}
              <div>
                <label
                  htmlFor="settings-api-key"
                  className="flex items-center gap-2 text-sm font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Key className="w-4 h-4 text-primary-500" />
                  Gemini API Key
                </label>
                <input
                  id="settings-api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIza..."
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all border focus:ring-2 focus:ring-primary-500/30"
                  style={{
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    borderColor: "var(--border-color)",
                  }}
                />
                <p
                  className="text-xs mt-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Your key is stored locally and never sent to our servers.
                </p>
              </div>

              {/* Model Selector */}
              <div>
                <label
                  htmlFor="settings-model"
                  className="flex items-center gap-2 text-sm font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Cpu className="w-4 h-4 text-accent-500" />
                  AI Model
                </label>
                <select
                  id="settings-model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all border cursor-pointer focus:ring-2 focus:ring-primary-500/30"
                  style={{
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  {AVAILABLE_MODELS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <p
                  className="text-xs mt-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Choose the Gemini model for content generation.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl font-heading font-semibold text-sm text-white flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    background: saved
                      ? "var(--color-success-500)"
                      : "var(--color-primary-500)",
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {saved ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved!
                    </>
                  ) : (
                    "Save Settings"
                  )}
                </motion.button>

                <motion.button
                  onClick={handleClear}
                  className="px-4 py-3 rounded-xl font-heading font-medium text-sm cursor-pointer border"
                  style={{
                    color: "var(--text-secondary)",
                    borderColor: "var(--border-color)",
                    background: "var(--bg-secondary)",
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Clear
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
