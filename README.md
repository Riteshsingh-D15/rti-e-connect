# RTI E CONNECT – AI-Powered Indian RTI Management Portal
> **"Transparency Through Technology"**

A modern, responsive, full-stack government technology platform built with **React.js & Next.js (JavaScript / JSX only)** adhering strictly to the statutory requirements of the **Right to Information Act, 2005** (India).

---

## 🏛️ System Overview

RTI E CONNECT bridges Indian citizens and Public Information Officers (PIOs) with automated artificial intelligence pipelines for:
1. **Intelligent Application Categorization** across 14 statutory sectors.
2. **Department Recommendation & Transfer (Section 6(3))** routing.
3. **Semantic Search via pgvector** with 384-dimensional cosine similarity ranking across historical precedents.
4. **Retrieval-Augmented Generation (RAG) Draft Response Engine** grounded in verified legal provisions (Sections 4(1)(b), 6(1), 7(1), 8(1)(j), and 19(1)).
5. **Separate First Appeal Adjudication Docket** for Departmental Appellate Authorities (FAA).

---

## ⚙️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js (App Router), React.js, Tailwind CSS, Lucide React, Recharts, React Hook Form, Zod |
| **Backend** | Next.js Route Handlers (`/api/...`), Server Actions, Node.js REST APIs |
| **Database** | PostgreSQL, Prisma ORM, pgvector for semantic embeddings |
| **Authentication**| NextAuth / Auth.js, Role-Based Access Control (RBAC), bcryptjs password hashing |
| **AI Engine** | Modular Multi-Provider Architecture (Gemini, OpenAI, Built-in High-Fidelity Local Vectorizer) |
| **File Management**| PDF, DOCX, JPG, PNG upload simulation, print receipt generation, OCR simulation |

---

## 👥 Pre-Seeded User Credentials

| Role | Email | Password | Access Area |
|---|---|---|---|
| **Citizen** | `citizen@example.com` | `password123` | `/citizen/dashboard`, `/citizen/submit`, `/citizen/track`, `/citizen/appeals` |
| **Government Officer** | `officer@example.com` | `password123` | `/officer/dashboard`, `/officer/applications`, `/officer/responses`, `/officer/semantic-search` |
| **Administrator** | `admin@example.com` | `password123` | `/admin/dashboard`, `/admin/users`, `/admin/officers`, `/admin/departments`, `/admin/analytics`, `/admin/settings` |

---

## 🚀 Getting Started

### 1. Installation
```bash
cd rti-connect
npm install
```

### 2. Environment Setup
Review `.env` (a `.env.example` is provided):
```env
NEXTAUTH_SECRET="rti-connect-secret-key-32-chars-long!!"
NEXTAUTH_URL="http://localhost:3001"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rticonnect?schema=public"

# Optional Cloud LLM Keys (Auto-detected; system uses high-fidelity local engine if omitted)
GEMINI_API_KEY=""
OPENAI_API_KEY=""
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📂 Project Architecture

```
rti-connect/
├── prisma/
│   ├── schema.prisma               # 18 Prisma models (PostgreSQL + pgvector)
│   └── seed.js                     # Seed script for live databases
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Login & Registration
│   │   ├── citizen/                # Dashboard, 4-step Submit, Track, Appeals, Profile
│   │   ├── officer/                # Officer Dashboard, Dossiers, AI Analysis, Semantic Search, Responses, Appeals
│   │   ├── admin/                  # Governance, Officers, Departments, Analytics (Recharts), Settings
│   │   └── api/                    # 11 REST API Route Handlers
│   ├── components/                 # Reusable UI, Forms, Layout, Charts, Tables
│   ├── lib/                        # Auth, Permissions, Prisma Client, Data Store
│   ├── services/
│   │   ├── ai/                     # Categorization, Department Mappings, Embeddings, RAG Generator
│   │   ├── semantic-search/        # pgvector Cosine Distance Search
│   │   ├── applications/           # Lifecycle Management & Status History
│   │   └── notifications/          # In-app notifications
│   └── validations/                # Zod schemas for auth and RTI submissions
└── README.md
```

---

## ⚖️ Compliance & Security
- **No ts/tsx files**: Pure JavaScript & JSX as mandated.
- **RTI Act, 2005 Section 7(1)**: 30-day statutory response tracking countdown.
- **Human In the Loop**: AI never automatically issues binding legal orders. Only authorized officers can approve and send official responses.
