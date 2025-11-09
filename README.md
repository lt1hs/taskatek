# Taskatek (تاسكاتك)

**Arabic-first, AI-powered project management platform**

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.11+
- Docker and Docker Compose (optional)
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd taskatek
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd server
pip install -r requirements.txt
cd ..
```

4. **Configure environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual credentials:
- Supabase URL and keys
- OpenAI API key
- Other service credentials

5. **Run the development servers**

**Option A: Using Docker Compose**
```bash
docker-compose up
```

**Option B: Run separately**

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
cd server
python main.py
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📁 Project Structure

```
taskatek/
├── app/                    # Next.js pages and API routes
│   ├── api/               # Next.js API endpoints
│   ├── dashboard/         # Dashboard pages
│   ├── spaces/            # Space management
│   ├── tasks/             # Task management
│   └── auth/              # Authentication pages
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   ├── task/              # Task-related components
│   ├── workspace/         # Workspace components
│   └── brain/             # AI Brain components
├── lib/                   # Utility libraries
│   ├── supabase/          # Supabase client and types
│   ├── brain/             # AI Brain logic
│   ├── utils/             # Helper functions
│   └── hooks/             # Custom React hooks
├── server/                # FastAPI backend
│   ├── api/               # API routes
│   ├── services/          # Business logic
│   ├── models/            # Data models
│   └── main.py            # FastAPI app entry point
└── public/                # Static assets
```

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (RTL-first)
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: Zustand + React Query
- **Drag & Drop**: @dnd-kit
- **Forms**: React Hook Form + Zod

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL (Supabase)
- **Caching**: Redis
- **AI**: LangChain + OpenAI
- **Vector DB**: Pinecone

### Key Features
- ✅ Multi-language support (Arabic/English)
- ✅ RTL-first design
- ✅ Real-time collaboration (Supabase Realtime)
- ✅ AI-powered task generation (Taskatek Brain)
- ✅ Multiple authentication methods
- ✅ 15+ task views
- ✅ Automation engine
- ✅ WhatsApp integration

## 📚 Documentation

- [Design Document](./.qoder/quests/unnamed-task.md)
- [API Documentation](http://localhost:8000/docs) (when running)

## 🔐 Authentication Methods

1. Email/Password
2. Google OAuth
3. Apple OAuth
4. WhatsApp OTP

## 🤖 Taskatek Brain (AI Features)

- AI Writer: Generate plans, emails, content
- AI Project Manager: Auto-create tasks and assignments
- AI Notetaker: Extract action items from meetings
- AI Knowledge Manager: Semantic search across workspace
- AI Image Generator: Create logos and visuals

## 🌍 Internationalization

The platform is Arabic-first with full English support:
- RTL layout by default for Arabic
- Dual-column approach for all user-facing text
- Arabic font: Tajawal
- Hijri calendar support
- Arabic number formatting options

## 📝 License

[Your License Here]

## 🙏 Acknowledgments

Inspired by ClickUp with Arabic-first approach for GCC markets.
