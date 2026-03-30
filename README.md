# Pomolearn

Pomolearn is an AI-powered study companion that combines the **Pomodoro Technique** with dynamic learning material generation. It helps users master any topic by breaking it down into focused, high-retainment study cycles, complete with comprehensive notes and adaptive quizzes.

---

## 🚀 Features

- **AI-Powered Learning Paths**: Dynamically generates structured study material for any topic using **Google Gemini**.
- **Customizable Sessions**: Fully configurable session parameters:
  - **Cycles**: 1 to 8 learning cycles.
  - **Duration**: Adjustable work (15-50min) and break (3-15min) times.
  - **Quizzes**: Tailored MCQ counts (5-40 questions) based on your session content.
- **Premium Animated UI**: A modern, glassmorphism-inspired interface built with **Framer Motion**.
- **Dark/Light Mode**: Full theme support with persistent preferences.
- **Custom AI Settings**:
  - **Rate Limiting**: Free tier includes 2 sessions per IP/day.
  - **Custom API Key**: Connect your own Gemini API key to bypass all limits.
  - **Model Selection**: Choose between various Gemini models (Flash, Pro, Lite).
- **Responsive Design**: Optimized for both desktop and mobile focused learning.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **AI Engine**: Google Generative AI ([Gemini 2.0 Flash](https://aistudio.google.com/))
- **Icons**: Lucide React
- **Markdown**: react-markdown + remark-gfm

---

## 📋 Prerequisites

- **Node.js** (v18.17.0 or later)
- **npm** or **yarn**
- **Google Gemini API Key**: [Get one for free here](https://aistudio.google.com/)

---

## ⚙️ Installation & Setup

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd pomolearn-new/pomolearn
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the `pomolearn` directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

---

## 🏃 How to Run

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

3. **Start Learning**:
   Enter a topic, adjust your session settings, and click **Start Learning Session**.

---

## 🧩 Architecture

- **`src/app`**: Next.js App Router pages and API routes.
- **`src/components`**: Reusable UI components (Timer, Settings, Hero, etc.).
- **`src/hooks`**: Custom hooks for core logic (`usePomodoroTimer`).
- **`src/store`**: Zustand stores for global application state.
- **`src/lib`**: Utility functions, AI clients, and rate limiting logic.

---

## 🔒 Rate Limiting & Privacy

- **Free Tier**: The application includes a built-in rate limiter (2 requests per IP every 24 hours) to manage server costs while using the default API key.
- **Custom Keys**: Users can provide their own API key in the **Settings** panel (bottom-left). Custom keys are stored only in your browser's `localStorage` and are never saved to our servers.
