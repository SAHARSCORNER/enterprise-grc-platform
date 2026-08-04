# Enterprise Governance, Risk, and Compliance (GRC) Platform

![React 19](https://img.shields.io/badge/Frontend-React_19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite)
![Vercel](https://img.shields.io/badge/Hosted_on-Vercel-000000?logo=vercel)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma)
![Socket.IO](https://img.shields.io/badge/WebSockets-Socket.IO-010101?logo=socketdotio)
![License](https://img.shields.io/badge/License-MIT-green)

A production-quality, enterprise-grade Governance, Risk, and Compliance (GRC) platform built with **React 19**, **TypeScript**, **Node.js Clean Architecture**, **Socket.IO WebSockets**, **React Flow** interactive topology graphs, and **AI Assistant** integration.

---

## 🚀 Live Demo & Documentation

- **Vercel Live App**: [https://enterprise-grc-platform.vercel.app](https://enterprise-grc-platform1.vercel.app) 
- **GitHub Repository**: [https://github.com/YOUR_GITHUB_USERNAME/enterprise-grc-platform](https://github.com/YOUR_GITHUB_USERNAME/enterprise-grc-platform)
- **Deployment & Security Manual**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Architecture Overview**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **API Specification**: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

---

## 🛡️ Key Features & Capabilities

- 📊 **Executive Dashboard**: Real-time GRC KPIs, 6-month compliance trends (ISO 27001, SOC 2), risk severity breakdown, and live audit feed.
- ⚡ **Interactive Standalone Showcase Mode**: Seamless fallback rendering so the live Vercel demo renders full charts and metrics out-of-the-box without requiring an external database connection.
- 🕸️ **Network Topology Graph (React Flow)**: Interactive graph visualizing Department Groups, Manager hierarchies, and Employee-Asset relationships.
- 🏷️ **Asset Inventory & QR Generator**: Barcode/QR code creation, life-cycle tracking, and risk-score assignment.
- 🛡️ **Risk Management Matrix**: Interactive 5×5 Likelihood vs Impact Heatmap Matrix and Risk Register.
- 📋 **Compliance Tracker**: Continuous framework control tracking across ISO 27001, SOC 2, NIST CSF, and CIS Controls.
- 🔍 **Audit & Vendor Management**: Internal audit lifecycle, questionnaire tracking, vendor security certificates, and contract expiries.
- 🤖 **AI Assistant**: Conversational GRC intelligence engine analyzing organizational risk postures.
- ⚡ **Real-Time WebSockets**: Socket.IO event pipeline synchronizing employee profiles, assets, and audit logs across all open clients instantly.

---

## 🔒 Credential Security Guarantee

This repository enforces strict security guidelines to prevent secret leakage:
- `.gitignore` ignores all `.env`, `.env.local`, SQLite databases (`dev.db`, `prisma/*.db*`), `node_modules`, and build artifacts.
- Safe templates are provided: [server/.env.example](server/.env.example) & [client/.env.example](client/.env.example).
- All secret keys and JWT passphrases must be supplied via Vercel or your hosting environment settings.

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

## 💻 Quick Start (Local Execution)

### Prerequisites
- **Node.js**: v18+ installed
- **npm**: v9+ installed

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
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

To launch the full-stack application using Docker Compose:

```bash
docker compose -f docker/docker-compose.yml up --build
```

---

## 🌐 Deploy to Vercel in 3 Steps

1. Push your repository to GitHub (refer to [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)).
2. Import your GitHub repository on [Vercel](https://vercel.com).
3. Set root directory to `client`, build command to `npm run build`, output directory to `dist`, and click **Deploy**.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
