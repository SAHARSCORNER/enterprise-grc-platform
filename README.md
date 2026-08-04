# Enterprise Governance, Risk, and Compliance (GRC) Platform

![React 19](https://img.shields.io/badge/Frontend-React_19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite)
![Vercel](https://img.shields.io/badge/Hosted_on-Vercel-000000?logo=vercel)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma)
![Socket.IO](https://img.shields.io/badge/WebSockets-Socket.IO-010101?logo=socketdotio)

A production-quality, enterprise-grade GRC web platform built with React 19, Clean Architecture, Socket.IO WebSockets, React Flow interactive topology graphs, and AI Assistant integration.

---

## 🚀 Live Demo & Deployment

- **Vercel Frontend**: [https://enterprise-grc-platform.vercel.app](https://enterprise-grc-platform.vercel.app) *(Replace with your live Vercel URL)*
- **GitHub Repository**: [https://github.com/YOUR_GITHUB_USERNAME/enterprise-grc-platform](https://github.com/YOUR_GITHUB_USERNAME/enterprise-grc-platform)
- **Deployment & Security Guide**: See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for step-by-step instructions.

---

## 🔒 Credential Security Guarantee

This repository strictly protects sensitive credentials, environment variables, and private database instances:
- `.gitignore` ignores all `.env`, `.env.local`, SQLite databases (`*.db`), `node_modules`, and build outputs.
- Safe templates are provided: [server/.env.example](server/.env.example) & [client/.env.example](client/.env.example).
- Secret keys and JWT passphrases must be supplied via Vercel / hosting provider environment variable management.

---

## Technical Highlights

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Flow (Network Graph), Recharts, Zustand, Framer Motion, React Router, TanStack Query.
- **Backend**: Node.js, Express.js, TypeScript, Clean Architecture, Socket.IO, Prisma ORM, JWT authentication, PDFKit, QRCode.
- **Database**: PostgreSQL / SQLite initialized with Prisma schema & realistic seed generator (100 Employees, 500 Assets, 100 Risks, 50 Vendors, 50 Incidents, 30 Policies, 20 Audits).
- **Real-Time Communication**: Socket.IO event-driven architecture synchronizing Employee profiles, Asset Inventory, Network Diagram, and Audit Logs across all open clients instantly.
- **AI Assistant**: Natural language GRC analytics engine evaluating live database state with a pluggable LLM interface.

---

## 💻 Quick Start (Local Execution)

### 1. Build Shared Types
```bash
cd shared
npm run build
```

### 2. Start Backend Server
```bash
cd server
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

### 3. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🌐 Deploy to Vercel in 3 Steps

1. Push your repository to GitHub (refer to [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)).
2. Import your GitHub repository on [Vercel](https://vercel.com).
3. Set root directory to `client`, framework preset to `Vite`, build command to `npm run build`, and click **Deploy**.

---

## 🔑 Key Modules Included

1. **Executive Dashboard**: Real-time KPIs, Compliance Trends (ISO 27001, SOC 2), Risk Breakdown, and Activity Feeds.
2. **Employee Directory**: Complete workforce management, department filters, and asset assignments.
3. **Asset Inventory**: Barcode & QR Code generation, risk scoring, life-cycle tracking.
4. **Network Diagram (React Flow)**: Interactive graph visualization of Department Groups, Manager hierarchies, and Employee-Asset relationships.
5. **Risk Management**: Risk Register and interactive 5×5 Heatmap Matrix (Likelihood × Impact).
6. **Compliance Module**: ISO 27001, SOC 2, NIST CSF, and CIS Controls security control tracking.
7. **Audit Module**: Audit planning, findings tracking, and corrective actions.
8. **Vendor Management**: Third-party security questionnaires, certificates, and contract expiries.
9. **Incident Management**: Incident response escalation, root cause analysis, and resolution timeline.
10. **Policy Management**: Version control, review cycle countdowns, and employee acknowledgements.
11. **AI Assistant**: Conversational GRC query engine.
12. **Reports Generator**: Instant PDF & CSV exports.
13. **System Audit Logs**: Immutable real-time trail of all user actions and IP addresses.
