import { create } from "zustand";

export interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface SessionConfig {
  cycles: number;
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  questionCount: number;
}

export interface UserSettings {
  apiKey: string;
  model: string;
}

export type AppPhase =
  | "landing"
  | "loading"
  | "learning"
  | "quiz-loading"
  | "quiz"
  | "results";

interface SessionState {
  // Core state
  topic: string;
  config: SessionConfig;
  cyclesContent: string[];
  mcqs: MCQ[];
  userAnswers: Record<string, string | null>;
  phase: AppPhase;
  score: number;
  rateLimited: boolean;

  // User settings
  settings: UserSettings;

  // Actions
  setTopic: (topic: string) => void;
  setConfig: (config: Partial<SessionConfig>) => void;
  setPhase: (phase: AppPhase) => void;
  setCyclesContent: (content: string[]) => void;
  setMcqs: (mcqs: MCQ[]) => void;
  setUserAnswer: (questionId: string, answer: string) => void;
  setScore: (score: number) => void;
  setRateLimited: (limited: boolean) => void;
  setSettings: (settings: Partial<UserSettings>) => void;
  reset: () => void;
}

const defaultConfig: SessionConfig = {
  cycles: 4,
  workDuration: 25,
  breakDuration: 5,
  questionCount: 25,
};

const defaultSettings: UserSettings = {
  apiKey: "",
  model: "gemini-2.5-flash",
};

// Load settings from localStorage if available
function loadSettings(): UserSettings {
  if (typeof window === "undefined") return { ...defaultSettings };
  try {
    const saved = localStorage.getItem("pomolearn-settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultSettings, ...parsed };
    }
  } catch {
    // ignore
  }
  return { ...defaultSettings };
}

function saveSettings(settings: UserSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("pomolearn-settings", JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export const useSessionStore = create<SessionState>((set, get) => ({
  topic: "",
  config: { ...defaultConfig },
  cyclesContent: [],
  mcqs: [],
  userAnswers: {},
  phase: "landing",
  score: 0,
  rateLimited: false,
  settings: loadSettings(),

  setTopic: (topic) => set({ topic }),
  setConfig: (config) =>
    set((state) => ({ config: { ...state.config, ...config } })),
  setPhase: (phase) => set({ phase }),
  setCyclesContent: (content) => set({ cyclesContent: content }),
  setMcqs: (mcqs) => set({ mcqs }),
  setUserAnswer: (questionId, answer) =>
    set((state) => ({
      userAnswers: { ...state.userAnswers, [questionId]: answer },
    })),
  setScore: (score) => set({ score }),
  setRateLimited: (rateLimited) => set({ rateLimited }),
  setSettings: (newSettings) => {
    const current = get().settings;
    const merged = { ...current, ...newSettings };
    saveSettings(merged);
    set({ settings: merged, rateLimited: false });
  },
  reset: () =>
    set({
      topic: "",
      config: { ...defaultConfig },
      cyclesContent: [],
      mcqs: [],
      userAnswers: {},
      phase: "landing",
      score: 0,
      rateLimited: false,
    }),
}));
