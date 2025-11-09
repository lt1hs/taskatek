```markdown
# Taskatek – Development & Programming Requirements  
**Full-Stack, Arabic-First, ClickUp + Brain Replica**  
**File:** `DEVELOPMENT.md`  

---

## 1. Project Overview  
**Taskatek (تاسْكاتِك)** is a **pixel-perfect, RTL-first, AI-powered** project management platform replicating **ClickUp + ClickUp Brain (2025)** with **full Arabic support**, enterprise scalability, and 1,000+ integrations.  

> **Tagline**: **تاسكاتك، بذكاء**  
> **AI Module**: **Taskatek Brain (تاسْك برين)**  

---

## 2. Tech Stack (Mandatory)

| Layer | Technology |
|------|------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS (RTL-first), shadcn/ui, Zustand, React Query |
| **Backend** | FastAPI (Python 3.11+), PostgreSQL (Supabase), Redis, BullMQ |
| **Realtime** | Supabase Realtime + WebSockets |
| **AI (Taskatek Brain)** | LangChain, OpenAI/Anthropic API, Arabic-tuned LLM (Llama 3.1 fine-tuned), Pinecone Vector DB |
| **Drag & Drop** | `@dnd-kit/core` + `@dnd-kit/sortable` |
| **Calendar / Gantt** | `FullCalendar` + `react-gantt-timeline` |
| **Forms** | React Hook Form + Zod (Arabic validation) |
| **Icons** | Lucide React + Custom Arabic SVG set |
| **Deployment** | Docker, AWS (me-central-1), Vercel, GitHub Actions |
| **Testing** | Cypress, Playwright (Arabic), Vitest, 90% coverage |

---

## 3. Core Architecture

```bash
/taskatek
├── /app                  # Next.js App Router
│   ├── dashboard/page.tsx
│   ├── spaces/[id]/page.tsx
│   ├── tasks/[id]/page.tsx
│   └── api/
├── /components
│   ├── ui/               # shadcn + RTL overrides
│   ├── KanbanBoard.tsx
│   ├── TaskModal.tsx
│   ├── TaskatekBrainSidebar.tsx
│   └── Sidebar.tsx
├── /lib
│   ├── supabaseClient.ts
│   ├── brain/            # LangChain agents
│   └── utils/arabic.ts
├── /public
│   └── fonts/tajalwal/
├── /server
│   └── api/              # FastAPI routes
└── docker-compose.yml
```

---

## 4. Functional Requirements (P1 = MVP)

### 4.1 Authentication & Localization
- [ ] Email + Google + Apple + **WhatsApp OTP** login  
- [ ] **RTL-first UI** with LTR fallback  
- [ ] Language toggle: **العربية / English** (auto-detect)  
- [ ] Arabic font: **Tajawal** (local + fallback)  
- [ ] JWT + Supabase Auth  

### 4.2 Hierarchy (Workspace → Task)
```ts
type Workspace { id, name_ar, name_en, owner_id }
type Space      { id, workspace_id, name_ar, icon }
type Folder     { id, space_id, name_ar }
type List       { id, folder_id, name_ar }
type Task       { id, list_id, title_ar, status, assignee[], subtasks[] }
```
- [ ] Full CRUD with **Arabic naming**  
- [ ] **Everything View** with global search (Arabic + Latin)  
- [ ] Drag-to-reorder (RTL-aware)  

### 4.3 Task Management
- [ ] Title, description (rich text, Arabic editor)  
- [ ] Custom fields: priority, labels, due date, time estimate  
- [ ] Subtasks, checklists, dependencies  
- [ ] **Time tracking** (play/pause, manual log)  
- [ ] **Voice-to-Task** (Arabic speech → text → task)  
- [ ] **WhatsApp → Task** (forward message → auto-create)  

### 4.4 Views (15+)
| View | Component | Status |
|------|---------|--------|
| List | `ListView.tsx` | [ ] |
| Board (Kanban) | `KanbanBoard.tsx` | [ ] |
| Calendar | `CalendarView.tsx` | [ ] |
| Gantt | `GanttChart.tsx` | [ ] |
| Workload | `WorkloadHeatmap.tsx` | [ ] |
| Mind Map | `MindMapView.tsx` | [ ] |
| Whiteboards | `WhiteboardCanvas.tsx` | [ ] |

### 4.5 Collaboration
- [ ] Real-time comments with **@اسم** (Arabic @mentions)  
- [ ] Assign comment → task  
- [ ] **Taskatek Docs** (Notion-style, Arabic proofreading)  
- [ ] **Chat View** with channels: `#المشروع-جديد`  
- [ ] File attachments (Supabase Storage)  

### 4.6 Automations
- [ ] No-code builder: **Trigger → Condition → Action**  
- [ ] 150+ pre-built:  
  - `عند تغيير الحالة → أرسل واتساب`  
  - `كل جمعة → تقرير أسبوعي`  
- [ ] AI-suggested automations  

### 4.7 Integrations (1,000+)
- [ ] Slack, Figma, Zoom, **WhatsApp Business**, Gmail, Outlook  
- [ ] **Zoho, Odoo, SAP** (GCC focus)  
- [ ] Webhook support  

---

## 5. Taskatek Brain (تاسْك برين) – AI Module

### 5.1 Core Agents
| Agent | Function | Prompt Example |
|------|----------|----------------|
| **AI Writer** | Draft plans, emails, summaries | `اكتب خطة تسويق 5 خطوات بالعربية` |
| **AI Project Manager** | Auto-create, assign, prioritize | `كلف المهام حسب الخبرة` |
| **AI Notetaker** | Zoom transcript → action items | `استخرج المهام من الاجتماع` |
| **AI Knowledge Manager** | Search across tasks/docs | `ابحث عن "تقرير Q3"` |
| **AI Image Gen** | DALL-E wrapper | `صمم شعار لمشروع جديد` |

### 5.2 Implementation
```ts
// lib/brain/agents.ts
export const projectManagerAgent = async (prompt: string) => {
  const chain = new LLMChain({ llm: arabicLLM, prompt: PROJECT_PLAN_PROMPT_AR });
  return chain.run(prompt);
};
```

- [ ] Arabic fine-tuned LLM (Llama 3.1 + LoRA)  
- [ ] Vector DB: Pinecone (index tasks, docs, comments)  
- [ ] **No data training** – user opt-in only  
- [ ] Sidebar chat: real-time streaming responses  

---

## 6. Database Schema (Supabase SQL)

```sql
-- Users
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  full_name_ar TEXT,
  full_name_en TEXT,
  avatar_url TEXT,
  lang_preference TEXT DEFAULT 'ar'
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  list_id UUID REFERENCES lists(id),
  title_ar TEXT,
  title_en TEXT,
  description HTML,
  status TEXT,
  priority INT,
  due_date TIMESTAMPTZ,
  time_tracked INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Taskatek Brain Logs
CREATE TABLE brain_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  prompt TEXT,
  response TEXT,
  agent_type TEXT,
  created_at TIMESTAMPTZ
);
```

---

## 7. Frontend Components (RTL-First)

```tsx
// components/KanbanBoard.tsx
'use client';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { useDirection } from '@/hooks/useRTL';

export default function KanbanBoard() {
  const { dir } = useDirection(); // 'rtl' or 'ltr'
  return (
    <DndContext collisionDetection={closestCenter}>
      <div dir={dir} className="flex gap-4 overflow-x-auto">
        {columns.map(col => <KanbanColumn key={col.id} column={col} />)}
      </div>
    </DndContext>
  );
}
```

- [ ] All components **RTL-first**  
- [ ] `useDirection()` hook for dynamic flip  
- [ ] Arabic placeholders: `ابحث في المهام...`  

---

## 8. API Routes (FastAPI)

```python
# server/api/tasks.py
@router.post("/tasks/")
async def create_task(task: TaskCreate, user=Depends(get_current_user)):
    return await task_service.create(task, user.id)
```

- [ ] GraphQL + REST hybrid  
- [ ] Rate limiting: 100 req/min per user  
- [ ] Arabic error messages  

---

## 9. Testing Strategy

| Type | Tool | Coverage |
|------|------|----------|
| Unit | Vitest | 90% |
| Integration | Supabase Test DB | All CRUD |
| E2E | Cypress + Playwright | Arabic flows |
| AI | Prompt accuracy >92% | 100 test cases |

```ts
// tests/brain.test.ts
test('AI generates Arabic plan', async () => {
  const res = await brainAgent.run('اكتب خطة');
  expect(res).toContain('الخطوة 1');
});
```

---

## 10. Deployment & DevOps

### `docker-compose.yml`
```yaml
services:
  frontend:
    build: .
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_SUPABASE_URL
  backend:
    image: python:3.11
    command: uvicorn server.main:app --host 0.0.0.0 --port 8000
  db:
    image: supabase/postgres
  redis:
    image: redis:7
```

- [ ] GitHub Actions: Lint → Test → Build → Deploy (Vercel + AWS)  
- [ ] Monitoring: Sentry, LogRocket (Arabic session replay)  
- [ ] Backup: Daily Supabase snapshots  

---

## 11. Development Checklist

- [ ] RTL Tailwind config (`tailwind.config.ts` with `dir: 'rtl'`)  
- [ ] Arabic font preloaded (`@font-face`)  
- [ ] All strings in `locales/ar.json` and `en.json`  
- [ ] Taskatek Brain sidebar always visible  
- [ ] Mobile: Bottom nav with **تاسكاتك** icon  
- [ ] Dark mode (Arabic contrast compliant)  
- [ ] PWA manifest with Arabic name  

---

## 12. Seed Data (Arabic)

```json
{
  "spaces": [
    { "name_ar": "مشروع التسويق", "name_en": "Marketing Project" },
    { "name_ar": "عميل جديد", "name_en": "New Client" }
  ],
  "tasks": [
    { "title_ar": "تصميم شعار", "status": "in_progress" }
  ]
}
```

---

**Taskatek is now fully programmable.**  
Run:  
```bash
git clone https://github.com/taskatek/app.git
docker-compose up
```

**Next**: Say **“Generate Taskatek Branding Kit”** → Get logo, Figma, app icon, website.
```