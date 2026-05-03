# 🔍 PipelineIQ

**AI-Powered CI/CD Debugging Assistant**

Debug pipeline failures in seconds, not hours. Drop your CI/CD logs or GitHub repo link — get root cause analysis and actionable fix suggestions powered by Gemini AI.

## ✨ Features

- **Instant Analysis**: Paste logs or drop GitHub repo URLs
- **Smart Classification**: Categorizes errors automatically 
  (Build Failure, Dependency Conflict, Environment Issues, etc.)
- **Plain English Explanations**: No DevOps jargon, 
  beginner-friendly summaries
- **Actionable Fix Steps**: Copy-paste ready terminal commands
- **Auto YML Generation**: Downloads corrected GitHub Actions 
  workflow files
- **Premium UI**: Dark mode, responsive design, 
  Dribbble-quality interface

## 🚀 Tech Stack

**Backend**: FastAPI (Python) + GitHub REST API + Gemini AI  
**Frontend**: React + Vite + TailwindCSS  
**Deployment**: Render (API) + Vercel (UI)

## 🛠️ Local Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- GitHub Personal Access Token (actions:read scope)
- Gemini API Key (free at aistudio.google.com)

### Backend Setup
```bash
cd pipelineiq-backend
pip install -r requirements.txt
cp .env.example .env
# Add your keys to .env
uvicorn main:app --reload --port 8001
```

### Frontend Setup
```bash
cd pipelineiq-frontend
npm install
npm run dev
```

Visit: http://localhost:5173

## 🔑 Getting API Keys

**GitHub Token**: 
Settings → Developer Settings → Personal Access Tokens (classic) 
→ Generate → Select "workflow" scope

**Gemini API Key**: 
Visit aistudio.google.com → Get API Key → Create in new project

## 📸 Screenshots

[Add 2-3 screenshots of the UI here during demo prep]

## 🎯 Built For

TIT SRIJAN 2026 Hackathon - Problem Statement 1:  
AI-Assisted Deployment Debugging for Modern Developers

## 👥 Team

[Add team member names here]

## 📄 License

MIT
