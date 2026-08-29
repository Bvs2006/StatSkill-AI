# StatSkill AI

**AI-Powered Competency Intelligence Platform for Official Statistics**

StatSkill AI is a full-stack government training and competency management platform designed for the **Ministry of Statistics and Programme Implementation (MoSPI)** and the **National Statistical Systems Training Academy (NSSTA)**. It provides a closed-loop learning system that continuously assesses, identifies gaps, recommends learning paths, and elevates the competency levels of government statistical officers.

---

## ✨ Key Features

### 🎯 Closed-Loop Competency Engine
The platform operates on a continuous **Assess → Gap → Learn → Elevate** cycle:
1. **Competency Assessment** — AI-generated MCQ assessments mapped to official statistical competency frameworks
2. **Skill Gap Analysis** — Automated identification of gaps between current proficiency and job-role requirements
3. **Personalized Learning Paths** — AI-curated learning journeys tailored to each officer's role, experience, and career goals
4. **Competency Elevation** — Post-learning reassessment with audit-logged score updates

### 👥 Multi-Role Architecture
- **👤 Learner (Official)** — Government officers who take assessments, follow learning paths, earn certificates, and track competency growth
- **🎓 Trainer** — Training faculty who generate AI-powered question banks, manage course content, and review learner analytics
- **👑 Admin** — Ministry administrators who manage employees, competency catalogues, training programmes, and view organization-wide analytics

### 🤖 AI-Powered Services
- **MCQ Generation** — Auto-generates validated multiple-choice questions from uploaded documents or text using Groq LLM (LLaMA 3.3 70B)
- **RAG Statistical Assistant** — Retrieval-Augmented Generation chatbot for answering queries related to official statistics methodology
- **Explainable Recommendations** — Transparent, traceable reasoning for every course and learning path recommendation
- **Sentence Embeddings** — In-browser WASM-powered semantic search using `all-MiniLM-L6-v2` transformer model

### 🏛️ iGOT Karmayogi Integration
Built-in adapter for **iGOT Karmayogi (Sunbird)** — India's national civil services training platform under Mission Karmayogi (DoPT). Supports:
- Mock mode with authentic Sunbird JSON schemas for offline development
- Live API mode for production HTTPS gateway connectivity
- Sunbird Obsrv v3.0 telemetry engine compatibility

### 🌐 Multilingual Support
Full interface localization in three languages:
- **English (EN)**
- **Hindi (हिंदी)**
- **Telugu (తెలుగు)**

### 🧪 Virtual Labs
Interactive terminal-based lab exercises for hands-on statistical computing practice with official datasets.

### 📜 Certificates
Automated certificate generation upon successful course and assessment completion.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                 React Frontend                   │
│         (Vite + TypeScript + Tailwind v4)        │
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Dashboard │ │ Courses  │ │ AI Assessment    │ │
│  │ Skills    │ │ Quizzes  │ │ Learning Paths   │ │
│  │ Profile   │ │ Labs     │ │ RAG Assistant    │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │ Services Layer                           │    │
│  │ storageService · aiService · igotAdapter │    │
│  │ i18n · documentParser · pyodideRunner    │    │
│  │ sentenceTransformer · courseContentData  │    │
│  └──────────────────────────────────────────┘    │
└───────────────────────┬─────────────────────────┘
                        │ REST API
┌───────────────────────▼─────────────────────────┐
│              FastAPI Backend                     │
│          (Python 3.11 + Uvicorn)                 │
│                                                  │
│  ┌──────────┐ ┌──────────────┐ ┌─────────────┐  │
│  │ Auth API │ │ Course Player│ │ Health Check │  │
│  └──────────┘ └──────────────┘ └─────────────┘  │
└───────────────────────┬─────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────┐
│            Supabase (PostgreSQL)                  │
│         + pgvector for semantic search            │
└──────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript 5.7 | Type-safe development |
| Vite 8 | Build tool & dev server |
| Tailwind CSS v4 | Utility-first styling |
| Recharts | Data visualization (radar, bar, line charts) |
| Pyodide (WASM) | In-browser Python execution for labs |
| Transformers.js | Client-side sentence embeddings |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | Python REST API framework |
| Uvicorn | ASGI server |
| Supabase | PostgreSQL database + auth + storage |
| pgvector | Vector similarity search |
| Groq API | LLM inference (LLaMA 3.3 70B) |
| PyJWT | JWT authentication |
| httpx | Async HTTP client |

### DevOps
| Technology | Purpose |
|---|---|
| Docker & Docker Compose | Containerized deployment |
| Render | Cloud deployment (free tier) |
| Vercel | Alternative frontend hosting |
| Nginx | Production static file serving |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 20.x
- **pnpm** (package manager)
- **Python** ≥ 3.11 (for backend)
- **Docker** (optional, for containerized setup)

### 1. Clone the Repository
```bash
git clone https://github.com/Bvs2006/StatSkill-AI.git
cd StatSkill-AI
```

### 2. Environment Setup

Copy the example environment file and fill in your keys:

```bash
# Frontend
cp .env.example .env

# Backend
cp backend/.env.example backend/.env
```

**Required environment variables:**

| Variable | Description |
|---|---|
| `VITE_GROQ_API_KEY` | Free API key from [Groq Console](https://console.groq.com) |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (backend only) |

### 3. Install & Run — Frontend

```bash
pnpm install
pnpm dev
```

The dev server starts on `http://localhost:8443` with hot reload enabled.

### 4. Install & Run — Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- API docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/health`

### 5. Docker (Full Stack)

```bash
docker-compose up --build
```

This starts:
- **Frontend** on port `80`
- **Backend** on port `8000`

---

## 📂 Project Structure

```
├── src/                          # React frontend source
│   ├── App.tsx                   # Main application component (all screens)
│   ├── main.tsx                  # React entrypoint
│   ├── index.css                 # Global CSS + Tailwind v4 import
│   ├── components/
│   │   ├── CoursePlayer/         # Interactive course learning player
│   │   ├── LecturePlayer.tsx     # Video/lecture playback component
│   │   ├── LiveTerminal.tsx      # Virtual lab terminal + exercises
│   │   └── ApiKeyModal.tsx       # API key configuration modal
│   └── services/
│       ├── storageService.ts     # Data models, persistence, competency engine
│       ├── aiService.ts          # Groq LLM integration (MCQ gen, RAG chat)
│       ├── igotAdapter.ts        # iGOT Karmayogi/Sunbird API adapter
│       ├── igotSunbirdService.ts # Sunbird content service layer
│       ├── i18n.tsx              # Multilingual translations (EN/HI/TE)
│       ├── documentParser.ts     # PDF/text document extraction
│       ├── pyodideRunner.ts      # In-browser Python/WASM execution
│       ├── sentenceTransformer.ts # Client-side semantic embeddings
│       └── courseContentData.ts  # Built-in course content catalogue
│
├── backend/                      # Python FastAPI backend
│   ├── app/
│   │   ├── main.py               # FastAPI app + CORS + router setup
│   │   ├── api/                  # API route handlers (auth, courses)
│   │   ├── core/                 # Configuration & settings
│   │   ├── db/                   # Database connection layer
│   │   ├── schemas/              # Pydantic request/response models
│   │   └── services/             # Business logic services
│   ├── migrations/               # Database migration scripts
│   ├── tests/                    # Backend test suite
│   ├── requirements.txt          # Python dependencies
│   └── Dockerfile                # Backend container image
│
├── index.html                    # Vite HTML shell
├── package.json                  # Frontend dependencies & scripts
├── vite.config.ts                # Vite + Tailwind + React plugin config
├── docker-compose.yml            # Multi-service Docker orchestration
├── render.yaml                   # Render.com deployment blueprint
├── vercel.json                   # Vercel SPA rewrite config
└── Dockerfile                    # Frontend container image (Nginx)
```

---

## 📋 Available Screens

| Screen | Role(s) | Description |
|---|---|---|
| Login | All | Authentication with demo persona quick-switch |
| Onboarding | All | 4-step profile setup wizard |
| Dashboard | All | Role-specific overview with key metrics |
| Skills | Learner | Competency radar chart & proficiency levels |
| Assessment | Learner | AI-generated MCQ competency assessment |
| Skill Gaps | Learner | Gap analysis against job-role requirements |
| Learning Path | Learner | Personalized AI-curated learning journey |
| Courses | All | Course catalogue with search & filters |
| Training Programmes | Learner, Admin | NSSTA official training programmes |
| Learning | Learner | Active learning & content consumption |
| Quizzes | Learner | Practice quizzes with instant feedback |
| Resources | Learner, Trainer | Study materials & reference documents |
| Assistant | All | RAG-powered statistical methodology chatbot |
| Certificates | Learner | Earned certificates & credentials |
| Virtual Labs | Learner | Hands-on terminal exercises |
| Trainer Portal | Trainer, Admin | Question bank, AI generation, analytics |
| Admin Panel | Admin | Employee management, analytics, competency catalogue |
| Profile | All | User profile & career information |
| Settings | All | Platform configuration & preferences |

---

## 🔐 Demo Accounts

The platform includes one-click demo login for all three roles:

| Role | Persona | Description |
|---|---|---|
| 👤 Official | Dr. Rajesh Sharma, ISS | Statistical Officer, Labour Statistics Division |
| 🎓 Trainer | — | NSSTA training faculty member |
| 👑 Admin | — | Ministry-level administrator |

---

## 🌍 Deployment

### Render (Recommended)

The included `render.yaml` blueprint deploys both services on Render's free tier:

```bash
# Deploy via Render Dashboard → New Blueprint Instance → connect repo
```

### Vercel (Frontend Only)

```bash
pnpm build
# Deploy the `dist/` folder to Vercel
```

### Docker

```bash
docker-compose up -d --build
```

---

## 📄 License

This project is developed for government capacity building under MoSPI / NSSTA initiatives.

---

<p align="center">
  <strong>StatSkill AI</strong> — Elevating Official Statistics Through Intelligent Learning<br/>
  <em>Assess → Gap → Learn → Elevate</em>
</p>
