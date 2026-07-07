# 🧠 MindPace AI

> An empathetic, GenAI-powered digital companion designed to monitor and improve the mental well-being of students preparing for high-stakes competitive exams (NEET, JEE, UPSC, CUET, CAT, GATE).

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-%238E75B2.svg?style=for-the-badge&logo=googlebard&logoColor=white)

---

## 📖 About
**MindPace AI** is a GenAI-powered mental wellness companion tailored specifically for students navigating the immense pressure of high-stakes competitive exams like NEET, JEE, UPSC, CUET, CAT, and GATE. Built to go beyond traditional habit tracking, MindPace utilizes advanced sentiment analysis via Gemini AI to provide personalized coping mechanisms, dynamic burnout risk assessment, and a safe, non-judgmental journaling space for students to reflect, vent, and recharge.

---

## 🎯 The Problem
Students preparing for major academic milestones often face severe stress, burnout, and self-doubt. Standard habit trackers fail to address the underlying emotional turmoil, and many gamified systems (like "daily streaks") actively induce anxiety when a student misses a day.

## 💡 The Solution
**MindPace AI** leverages Generative AI to act as a safe, non-judgmental space for students. Instead of counting checkboxes, it analyzes open-ended journaling to uncover hidden stress triggers, models burnout risk, and provides real-time, hyper-personalized coping strategies grounded in the specific exam the student is studying for.

## ✨ Key Features
- **📝 Intelligent Daily Vent:** A free-form journaling space where students can pour out their thoughts. The app uses Gemini 2.5 Flash to analyze the text, extract sentiment, and identify specific stressors.
- **📊 Burnout Risk Meter & Mood Trends:** A wellness-focused dashboard that avoids anxiety-inducing vanity metrics. It displays a 7-day visual mood trend and a live 0-100 Burnout Risk Score based on recent journal history.
- **🎯 Dynamic Trigger Matrix:** Automatically aggregates and counts hidden stressors extracted from journal entries, helping students visualize their recurring roadblocks.
- **🧘 Actionable Mindfulness Integration:** An interactive, 2-minute guided breathing tool tied directly to AI-generated coping strategies.
- **🤝 CalmCompanion:** An always-available, exam-aware AI digital buddy that validates feelings, reduces study-related stress, and provides contextual motivation.

---

## 🚀 Live Demo & Getting Started
You can test the application using the following reviewer credentials:
- **Email:** `user@mail.com`
- **Password:** `abcd243`

*(Note: Reviewers can also sign up for a fresh account to experience the onboarding flow and exam selection process).*

### 🔑 Using AI Features (Important)
Because this app is deployed as a static site (e.g. GitHub Pages), the private Gemini API keys are intentionally kept out of the public source code. 
To use the AI features (Daily Vent analysis, CalmCompanion, etc.), you will need to provide a Gemini API Key:
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and generate a **free** Gemini API key.
2. Inside the MindPace AI app, click the **Settings (⚙️ Gear Icon)** in the top right of the navigation bar.
3. Paste your API key and click **Save Settings**. 

> *Security Note: Your key is securely stored in your browser's local storage. It is never sent to our servers, and it ensures the app remains completely free and secure.*

---

## 🛠️ Tech Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend/Auth/DB:** Firebase Authentication, Cloud Firestore (Real-time listeners)
- **AI Integration:** Google GenAI SDK (`@google/genai`) powered by **Gemini 2.5 Flash**
- **Hosting:** GitHub Pages / Vercel

---

## 💻 Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/AnishAaron/mindpace-ai.git
   cd mindpace-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory and add your keys:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

---
*Built for the GenAI Wellness Hackathon.*
