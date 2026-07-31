# GigShield

Submission for the Synaptrix

## Problem Statement Chosen

**Domain:** GigShield

**Problem Statement:** Gig workers (delivery riders, drivers) often can't tell whether the fare they're paid for a job is actually fair, have no easy way to track burnout-inducing hours, and lack a simple way to flag unsafe routes or raise complaints — all while juggling multiple platforms with no unified view of their earnings.

## Team

**Team Name:AI Alchemists**

## Our Solution

GigShield is a companion web app for gig workers that checks every logged delivery or ride against a fair-rate benchmark (base fare + per-km + per-minute + night bonus) and flags underpaid jobs automatically. It gives workers a single dashboard across multiple platforms (Uber, Ola, Namma Yatri, Rapido, Swiggy, Zomato, Zepto, Blinkit) to track earnings, fairness scores, and burnout risk over time. An AI advisor answers open-ended questions about fares, worker rights, and earnings using the worker's own logged job data as context. Users can register/log in via email or Google (Firebase Authentication), log jobs manually or by scanning a screenshot, and access a fairness checker, complaints drafting tool, and community benchmark comparisons.

## AI Component

- **What AI is used:** Groq API (Llama 3.3 70B Versatile) via the `/api/chat` backend route
- **What it does in your app:** Powers the "AI advisor" chatbot — answers open-ended questions about fare fairness, gig worker rights, drafting complaints, and earnings, grounded in the user's own logged job data (fairness scores, flagged underpayments, night-shift patterns) passed in as context. Falls back to a rule-based response system automatically if no API key is configured, so the app never breaks.
- **Why we chose this approach:** Groq offers a genuinely free tier with fast inference and an OpenAI-compatible API, making it easy to integrate without requiring paid credits — important for a hackathon project that needs to run on any judge's machine.

## Tech Stack

- **Frontend:** React (Vite), Chart.js
- **Backend:** Node.js, Express
- **AI/ML:** Groq API (Llama 3.3 70B Versatile)
- **Database/Storage:** Firebase Authentication (email/password + Google sign-in); in-memory mock job data on the backend (Realtime Database integration planned)
- **Other tools/APIs:** Firebase (Auth)

## Features Implemented

**Core Requirements:**
- User registration/login via email+password and Google sign-in (Firebase Authentication)
- Dashboard with fairness overview across logged jobs
- Manual job logging (platform, fare, distance, duration, time, pickup/drop area, notes)
- Fairness checker comparing paid fare vs. expected fare benchmark (base + per-km + per-min + night bonus)
- AI advisor chatbot for open-ended questions, grounded in the user's job data
- Earnings analytics and weekly insights
- Complaints drafting based on flagged underpaid jobs
- Community benchmark comparison

**Bonus Features Attempted:**
- Screenshot scanning for job logging (OCR-style entry)
- Safety score and burnout watch tracking
- Savings goal tracking
- Admin panel

## How to Run This Project

This project has two parts — a `frontend` (Vite/React) and a `backend` (Node/Express) — both need to be running at the same time.

```bash
# Clone the repo
git clone https://github.com/aastha2208/reactapp.git
cd reactapp

# Install dependencies
cd frontend
npm install

cd ../backend
npm install
```

```bash
# Copy the example env file and fill in your own key
cd backend
cp .env.example .env
# then open .env and paste your own Groq API key:
# GROQ_API_KEY=your_key_here
```

```bash
# Run the project — needs two terminals open at the same time

# Terminal 1 — backend
cd backend
node --env-file=.env server.js

# Terminal 2 — frontend
cd frontend
npm run dev
```

Then open the URL Vite prints (typically `http://localhost:5173`) in your browser.

> If your Node version is below v20.6, `--env-file` isn't supported — instead set the variable directly before running:
> - PowerShell: `$env:GROQ_API_KEY="your_key_here"; node server.js`
> - macOS/Linux: `GROQ_API_KEY=your_key_here node server.js`

## API Keys / Environment Variables

This project needs **one** environment variable, set in `backend/.env` (see `backend/.env.example` for the exact name):

| Variable | Required? | Purpose |
|---|---|---|
| `GROQ_API_KEY` | Optional | Powers the live AI advisor chat via Groq's free tier (console.groq.com/keys). Without it, the chatbot automatically falls back to rule-based answers — the app still runs fully otherwise. |

`.env` is excluded via `.gitignore` and should never be committed. `.env.example` (committed, with placeholder values only) shows judges exactly which keys to add on their end.

