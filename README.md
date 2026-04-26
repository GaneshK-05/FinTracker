# 💰 FinTracker — Smart Personal Finance Tracker

A full-stack personal finance tracking application with **behavioral analytics**, **smart alerts**, and **what-if simulations**.

![Tech Stack](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=000&style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=fff&style=flat-square)
![Express](https://img.shields.io/badge/Express-000?logo=express&logoColor=fff&style=flat-square)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=fff&style=flat-square)

---

## ✨ Features

- 🔐 **Authentication** — Secure signup/login with bcrypt + JWT
- 💸 **Transaction Management** — Full CRUD with filtering by category, type, date
- 📊 **Interactive Charts** — Pie, Area, Bar, and Line charts via Recharts
- 🎯 **Savings Goals** — Create, track progress, add funds with deadline tracking
- 🧠 **Financial Health Score** — Composite score based on savings ratio, spending consistency, and goal completion
- 🔔 **Smart Alerts** — Automated warnings for overspending, zero savings, and approaching goal deadlines
- 🔮 **What-If Simulation** — Project future balances with custom monthly savings inputs
- 🌗 **Premium Dark UI** — Glassmorphism, gradients, micro-animations

---

## 🏗️ Architecture

```
┌─────────────┐      ┌─────────────────┐      ┌──────────────┐
│   React +   │ ───► │  Node/Express   │ ───► │   Supabase   │
│   Vite      │ HTTP │  REST API       │ SQL  │  PostgreSQL  │
│   (Client)  │ ◄─── │  JWT Auth       │ ◄─── │   Cloud DB   │
└─────────────┘      └─────────────────┘      └──────────────┘
```

---

## 📁 Project Structure

```
├── server/                 # Backend
│   ├── config/supabase.js  # Supabase client
│   ├── middleware/auth.js  # JWT middleware
│   ├── routes/
│   │   ├── auth.js         # Signup, Login, Profile
│   │   ├── transactions.js # CRUD + Filters
│   │   ├── goals.js        # CRUD
│   │   └── analytics.js    # Summary, Health Score, Alerts, What-If
│   ├── index.js            # Server entry
│   └── .env                # Environment variables
│
├── client/                 # Frontend
│   └── src/
│       ├── components/Layout/  # Sidebar, Topbar, AppLayout
│       ├── context/AuthContext.jsx
│       ├── pages/          # Login, Signup, Dashboard, Transactions, Goals, Insights, Profile
│       ├── services/api.js # Axios client
│       └── index.css       # Design system
│
└── supabase_setup.sql      # Database migration
```

---

## 🚀 Getting Started

### 1. Database Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Open the SQL Editor and run the contents of `supabase_setup.sql`
3. Copy your **Project URL** and **Service Role Key**

### 2. Backend

```bash
cd server
cp .env .env.local  # Edit with your Supabase credentials & JWT secret
npm install
npm run dev
```

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

The app will be running at `http://localhost:5173`.

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `JWT_SECRET` | Secret key for JWT signing |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only) |

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get profile |
| PUT | `/api/auth/me` | Update profile |
| GET | `/api/transactions` | List (with filters) |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/:id` | Update |
| DELETE | `/api/transactions/:id` | Delete |
| GET | `/api/goals` | List goals |
| POST | `/api/goals` | Create goal |
| PUT | `/api/goals/:id` | Update goal |
| DELETE | `/api/goals/:id` | Delete goal |
| GET | `/api/analytics/summary` | Income/expense/category stats |
| GET | `/api/analytics/health-score` | Financial health score |
| GET | `/api/analytics/alerts` | Smart alerts |
| POST | `/api/analytics/what-if` | What-if simulation |

---

## 🛡️ Security

- Passwords hashed with **bcrypt** (12 rounds)
- Routes protected via **JWT** middleware
- Input validation on all endpoints
- CORS restricted to frontend origin

---

## 📱 Pages

| Page | Description |
|---|---|
| Login | Email/password authentication |
| Signup | Registration with validation |
| Dashboard | Stats, charts, recent transactions, alerts |
| Transactions | Full CRUD table with filters |
| Goals | Savings goals with progress bars |
| Insights | Health score, bar charts, what-if simulation |
| Profile | User info, stats, edit name, logout |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Charts | Recharts |
| Icons | Lucide React, React Icons |
| Notifications | React Hot Toast |
| Backend | Node.js + Express |
| Auth | bcryptjs + jsonwebtoken |
| Database | Supabase (PostgreSQL) |
| HTTP Client | Axios |

---

## 📦 Deployment

- **Frontend** → Vercel / Netlify
- **Backend** → Railway / Render
- **Database** → Supabase Cloud (already hosted)

---

*Built as a full-stack portfolio project demonstrating CRUD, authentication, data visualization, and behavioral analytics.*
