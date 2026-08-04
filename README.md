# Enterprise Governance, Risk, and Compliance (GRC) Platform

![React 19](https://img.shields.io/badge/Frontend-React_19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma)
![Socket.IO](https://img.shields.io/badge/WebSockets-Socket.IO-010101?logo=socketdotio)
![License](https://img.shields.io/badge/License-MIT-green)

A production-quality, enterprise-grade Governance, Risk, and Compliance (GRC) platform built with **React 19**, **TypeScript**, **Node.js Clean Architecture**, **Prisma ORM**, **Socket.IO WebSockets**, **React Flow** interactive topology graphs, and an integrated **AI Assistant**.

---

## 🚀 Live Demo & Repository Links

- **GitHub Repository**: [https://github.com/SAHARSCORNER/enterprise-grc-platform](https://github.com/SAHARSCORNER/enterprise-grc-platform)
- **Deployment Manual**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Architecture Overview**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **API Documentation**: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

---

## 🛡️ Key Platform Modules

1. **Executive Dashboard**: Real-time GRC KPIs, 6-month compliance trends (ISO 27001, SOC 2), risk severity breakdown, and live audit feed. Includes an **Interactive Showcase Mode** for standalone client rendering.
2. **Employee Directory**: Full workforce management, department filters, status tracking, and manager-employee relationships.
3. **Asset Inventory**: Barcode & QR Code generation, hardware/software lifecycle tracking, and automated asset risk scoring.
4. **Interactive Network Graph (React Flow)**: Visual topology diagram representing Department Groups, Manager hierarchies, and Employee-Asset connections.
5. **Risk Management**: Risk Register with impact/likelihood scoring and an interactive 5×5 Heatmap Matrix.
6. **Compliance Tracker**: Continuous security control monitoring for ISO 27001, SOC 2, NIST CSF, and CIS Controls.
7. **Audit Module**: Audit planning, internal finding management, corrective action tracking, and completion workflows.
8. **Vendor Management**: Third-party risk assessments, security questionnaires, vendor certificates, and contract expiries.
9. **Incident Management**: Security incident response workflows, root cause analysis, and resolution timelines.
10. **Policy Management**: Policy version control, review cycle countdowns, and employee acknowledgment tracking.
11. **AI Assistant**: Natural language GRC analytics engine evaluating live database state with a pluggable LLM interface.
12. **Reports Generator**: Instant automated PDF & CSV exports for audit readiness.
13. **System Audit Logs**: Immutable real-time trail of all user actions, IP addresses, and system events.

---

## 🏗️ System Architecture

```
                               ┌─────────────────────────┐
                               │   React 19 Client UI    │
                               │  (Vite + Tailwind CSS)  │
                               └────────────┬────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     │                                             │
             HTTP / REST API                                 WebSockets / Real-time
        (Express Clean Architecture)                        (Socket.IO Event Hub)
                     │                                             │
                     └──────────────────────┬──────────────────────┘
                                            │
                               ┌────────────▼────────────┐
                               │     Prisma ORM Layer    │
                               └────────────┬────────────┘
                                            │
                               ┌────────────▼────────────┐
                               │ SQLite / PostgreSQL DB  │
                               └─────────────────────────┘
```

---

## 🔒 Credential Security Guarantee

This project strictly enforces credential protection and secret management:
- `.gitignore` ignores all `.env`, `.env.local`, SQLite databases (`dev.db`, `prisma/*.db*`), `node_modules`, and build outputs.
- Safe templates are provided: [server/.env.example](server/.env.example) & [client/.env.example](client/.env.example).
- All secret keys and JWT passphrases must be supplied via environment variables.

---

## 💻 Quick Start (Local Execution)

### Prerequisites
- **Node.js**: v18+ installed
- **npm**: v9+ installed

### 1. Clone & Build Shared Types
```bash
git clone https://github.com/SAHARSCORNER/enterprise-grc-platform.git
cd enterprise-grc-platform
npm --prefix shared run build
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
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

To launch the entire platform stack using Docker Compose:

```bash
docker compose -f docker/docker-compose.yml up --build
```

---

## 🌐 Vercel Deployment Settings

When deploying the frontend to **Vercel**:
- **GitHub Repository**: `SAHARSCORNER/enterprise-grc-platform`
- **Root Directory**: `./` (or `client`)
- **Framework Preset**: `Vite`
- **Build Command**: `npm --prefix shared run build && npm --prefix client run build`
- **Output Directory**: `client/dist`

---

## 📄 License

This project is licensed under the MIT License.
