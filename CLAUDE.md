# E-RealEstate — Claude Project Guide

## Project Overview

A full-stack property rental management SaaS platform with role-based access for **Superadmins**, **Landlords**, and **Tenants**.

## Tech Stack

### Backend (`/backend`)
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.x
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Auth:** JWT + Bcrypt
- **File Uploads:** Multer → local disk (`backend/uploads/`), served statically at `/uploads`
- **Email:** Nodemailer via Brevo HTTP API (not SMTP — Render blocks SMTP ports)
- **SMS:** Beem Africa
- **Scheduler:** node-cron
- **Security:** Helmet.js, CORS, express-rate-limit

### Frontend (`/admin`)
- **Framework:** React 18 + Vite 6
- **Styling:** TailwindCSS 3 + Flowbite React
- **Routing:** React Router DOM 7
- **HTTP:** Axios
- **Charts:** Chart.js + react-chartjs-2
- **Animations:** Framer Motion
- **Notifications:** React Hot Toast, React Toastify

## Project Structure

```
E-RealEstate/
├── admin/              # React admin dashboard (all roles share this frontend)
│   ├── src/
│   │   ├── components/ # Shared UI (Layout, Navbar, Sidebar, ProtectedRoute)
│   │   ├── contexts/   # React Context for global state
│   │   ├── pages/
│   │   │   ├── landlord/    # Landlord dashboard pages
│   │   │   ├── superadmin/  # Admin pages
│   │   │   └── tenant/      # Tenant pages
│   │   └── hooks/      # Custom React hooks
│   └── vite.config.js
│
└── backend/
    ├── config/         # MongoDB + Nodemailer config
    ├── controller/     # Route handlers (auth, landlord, superadmin, tenant)
    ├── middleware/     # Auth middleware
    ├── models/         # Mongoose schemas (User, House, Lease, RentRecord, MaintenanceRequest, Document, Reminder)
    ├── routes/         # API routes
    ├── services/       # Business logic
    ├── utils/cronJob.js # Scheduled tasks
    └── server.js       # Entry point
```

## Running Locally

**Backend** (port 4000):
```bash
cd backend
npm install
npm run dev
```

**Frontend** (port 5174):
```bash
cd admin
npm install
npm run dev
```

## Environment Variables

**Backend** (`backend/.env.local`):
- `PORT=4000`
- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET`
- Superadmin / Landlord / Tenant seed credentials
- Brevo API key for email
- Beem Africa credentials for SMS (`BEEM_API_KEY`, `BEEM_SECRET_KEY`, `BEEM_SOURCE_ADDR`)
- `WEBSITE_URL=http://localhost:5174`

**Frontend** (`admin/.env`):
- `VITE_BACKEND_URL=http://localhost:4000`

## API Routes

| Prefix | Purpose |
|--------|---------|
| `/api/auth` | Login, register, forgot password |
| `/api/admin` | Superadmin — user/system management |
| `/api/landlord` | Property, tenant, rent management |
| `/api/tenant` | Lease view, rent payment, maintenance requests |

## User Roles

- **Superadmin** — full system control, user management
- **Landlord** — manages properties, tenants, rent collection
- **Tenant** — views leases, submits maintenance requests, pays rent

## Key Architectural Decisions

- **Email via Brevo HTTP API** (not SMTP) — Render.com blocks SMTP ports 465/587
- **SMS via Beem Africa** for rent reminders
- **Local disk storage** for all file/photo uploads (Multer writes to `backend/uploads/`, served statically) — note this may not persist across Render redeploys since container-local disk is typically ephemeral; the `imagekit` package is an installed-but-unused dependency, not wired to anything
- **MongoDB Atlas** for cloud database — no local MongoDB needed
- **Single frontend** (`/admin`) serves all three roles with route-based access control via `ProtectedRoute`
- **node-cron** handles automated rent reminders and scheduled tasks

## Deployment

- **Backend:** Render (see `backend/RENDER_DEPLOYMENT.md`)
- **Frontend:** Vercel (see `admin/vercel.json`)
- **Database:** MongoDB Atlas

## Common Scripts

```bash
# Backend
npm run dev     # nodemon dev server
npm start       # production server

# Frontend
npm run dev     # Vite dev server
npm run build   # production build
npm run lint    # ESLint
```
