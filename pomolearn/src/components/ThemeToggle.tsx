"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="fixed top-5 right-5 z-50 w-11 h-11 rounded-full" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      id="theme-toggle"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="fixed top-5 right-5 z-50 w-11 h-11 rounded-full glass flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform"
      style={{
        boxShadow: "var(--shadow-md)",
      }}
      whileHover={{ rotate: 15 }}
      whileTap={{ scale: 0.9 }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <Sun className="w-5 h-5 text-amber-400" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <Moon className="w-5 h-5 text-primary-700" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
