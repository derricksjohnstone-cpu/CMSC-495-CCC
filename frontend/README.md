# LeaveHub Frontend

The frontend for the Leave Request Approval System, built with Next.js, TypeScript, and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js v24 (LTS) — [download here](https://nodejs.org)
- npm (comes with Node.js)

### Installation

```bash
cd frontend
npm install
```

### Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx                 # Root layout (font, metadata)
│   ├── page.tsx                   # Root page (redirects based on auth)
│   ├── login/
│   │   └── page.tsx               # Login page
│   ├── employee/
│   │   ├── page.tsx               # Employee dashboard
│   │   ├── submit/
│   │   │   └── page.tsx           # Leave request form
│   │   └── requests/
│   │       └── page.tsx           # Employee request history
│   └── manager/
│       ├── page.tsx               # Manager dashboard
│       ├── calendar/
│       │   └── page.tsx           # Team calendar
│       └── requests/
│           └── page.tsx           # All requests history
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx            # Sidebar navigation
│   │   └── Header.tsx             # Page header with greeting
│   ├── cards/
│   │   └── SummaryCard.tsx        # Reusable metric card
│   ├── ui/
│   │   ├── StatusBadge.tsx        # Status badge (Pending, Approved, etc.)
│   │   └── LeaveTypeBadge.tsx     # Leave type badge (Vacation, Personal, etc.)
│   └── requests/
│       └── RequestCard.tsx        # Individual request display card
└── public/
    └── loginImage.jpg             # Login page illustration
```

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Font:** Rubik (Google Fonts)

## Design Notes

- The app has two role-based views: **Employee** and **Manager**
- After login, users are redirected to their respective dashboard based on their role
- Shared components (StatusBadge, LeaveTypeBadge, SummaryCard, Sidebar, Header) are reused across both dashboards
- The layout is responsive — mobile uses a bottom navigation bar and stacked layout, while desktop uses a sidebar and multi-column layouts

## Backend API

The frontend connects to a FastAPI backend. API base URL will be configured via environment variables.

**Key endpoints (expected):**
- `POST /auth/login` — Authenticate user
- `GET /users/{user_id}` — Get user profile
- `GET /users/{user_id}/requests` — Get user's leave requests
- `GET /users/{user_id}/balances` — Get user's leave balances
- `GET /manager/requests/pending` — Get all pending requests
- `GET /manager/calendar` — Get team calendar data

> **Note:** Some endpoints are still in development. Check with the backend team for the latest API status.