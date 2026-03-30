# Pomolearn

Pomolearn is an AI-powered study companion that combines the **Pomodoro Technique** with dynamic learning material generation. It helps users learn complex topics by breaking them down into digestible 25-minute study cycles, complete with comprehensive notes and a final assessment quiz.

---

## 🚀 Features

- **Dynamic Content Generation**: Uses Google's **Gemini 2.5 Flash** to generate structured study material for any topic.
- **Pomodoro-Optimized**: Automatically breaks down your learning into **4 distinct 25-minute cycles**, each progressing logically from the previous one.
- **Comprehensive Notes**: Each cycle provides approximately 1000-1500 words of pointers and explanations.
- **Interactive Quiz**: After completing the study cycles, users can take a **25-question MCQ quiz** generated specifically from the learned material to test their understanding.
- **Clean Interface**: A simple, focused frontend for an uninterrupted learning experience.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **AI Engine**: Google Generative AI (`@google/generative-ai`)
- **Model**: `gemini-2.5-flash`
- **Frontend**: Vanilla HTML5, CSS3, JavaScript
- **Environment**: Dotenv for secure API key management

---

## 📋 Prerequisites

- **Node.js** (v18+ recommended)
- **npm** (Node Package Manager)
- **Google Gemini API Key**: You can obtain one from the [Google AI Studio](https://aistudio.google.com/).

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
   Create a `.env` file in the `pomolearn` directory (you can use `.env.example` as a template):
   ```env
   GEMINI_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY_HERE
   PORT=3000
   ```

---

## 🏃 How to Run

1. **Start the server**:

   ```bash
   node server.js
   ```

2. **Open the application**:
   Navigate to `http://localhost:3000` in your web browser.

3. **Start Learning**:
   Enter a topic you want to learn, and let Pomolearn guide you through the cycles!

---

## 🧩 API Endpoints

- `POST /api/generate-content`: Generates 4 cycles of study material for a given `topic`.
- `POST /api/generate-quiz`: Generates 25 MCQs based on the provided `content` array.
