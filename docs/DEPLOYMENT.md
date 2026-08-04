# Deployment & Security Guide

This guide details step-by-step instructions to safely publish the **Enterprise Governance, Risk, and Compliance (GRC) Platform** to GitHub and host the live frontend on **Vercel** without leaking credentials or secret keys.

---

## 🔒 1. Security & Credential Protection

Before committing or pushing any code to GitHub, verify that sensitive files are excluded from source control.

### Files Excluded via `.gitignore`
- **Environment files**: `.env`, `.env.local`, `*.env`
- **Database files**: `dev.db`, `prisma/*.db`, `*.sqlite`, `*.db-journal`
- **Node modules**: `node_modules/`, `client/node_modules/`, `server/node_modules/`
- **Build artifacts**: `dist/`, `build/`, `outputs/`, `*.tsbuildinfo`

### Environment Templates (`.env.example`)
Both `server` and `client` folders include safe `.env.example` templates:
- `server/.env.example`: Provides dummy variable keys for `PORT`, `DATABASE_URL`, `JWT_SECRET`, and `AI_PROVIDER`.
- `client/.env.example`: Provides template keys for `VITE_API_BASE_URL` and `VITE_SOCKET_URL`.

---

## 🐙 2. Pushing to GitHub (Step-by-Step)

### Prerequisites
- Install **Git** on your machine ([git-scm.com](https://git-scm.com/)) or use **GitHub Desktop**.
- A GitHub account ([github.com](https://github.com/)).

### Commands

1. **Initialize Git repository in project root (`c:\grc`)**:
   ```bash
   git init
   git branch -M main
   ```

2. **Stage and inspect tracked files**:
   ```bash
   git add .
   git status
   ```
   > ⚠️ **Verification Check**: Ensure `.env` and `dev.db` do NOT appear in the list of staged files.

3. **Commit code**:
   ```bash
   git commit -m "feat: Initial commit for Enterprise GRC Platform"
   ```

4. **Create a new GitHub Repository**:
   - Go to [github.com/new](https://github.com/new).
   - Name: `enterprise-grc-platform`.
   - Set visibility to **Public** or **Private**.
   - Do **NOT** initialize with a README (we already have one).

5. **Link remote and push**:
   ```bash
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/enterprise-grc-platform.git
   git push -u origin main
   ```

---

## 📐 3. Live Frontend Hosting on Vercel

Vercel provides free, high-performance static hosting with global CDN edge deployment for Vite React applications.

### Deploying via Vercel Web Dashboard (Recommended)

1. **Sign in to Vercel**:
   - Go to [vercel.com](https://vercel.com/) and log in with your GitHub account.

2. **Import Project**:
   - Click **"Add New..."** -> **"Project"**.
   - Select your GitHub repository (`enterprise-grc-platform`).

3. **Configure Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Select `client` (or leave default if Vercel detects Vite inside `/client`).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Set Environment Variables**:
   Under **Environment Variables**, add:
   | Key | Value | Description |
   |---|---|---|
   | `VITE_API_BASE_URL` | `https://your-backend-api.onrender.com/api/v1` | URL of your deployed backend (or relative `/api/v1`) |
   | `VITE_SOCKET_URL` | `https://your-backend-api.onrender.com` | Socket.IO server endpoint |

5. **Deploy**:
   - Click **"Deploy"**. Vercel will build the frontend and generate a live public URL (e.g., `https://enterprise-grc-platform.vercel.app`).

### Single Page Application (SPA) Routing
The included `client/vercel.json` and `vercel.json` rewrite configuration ensure that client routes (`/dashboard`, `/inventory`, `/network`, `/compliance`, `/audit`) work seamlessly without 404 errors on browser page refreshes.

---

## ⚡ 4. Backend Hosting Options

For full interactive real-time functionality (Socket.IO, Express API, Prisma DB):

1. **Render.com** (Recommended Free Tier):
   - Deploy `server/` as a **Web Service**.
   - Environment variables: Set `JWT_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL` in Render environment settings.
   - Build Command: `npm install && npx prisma db push && npx tsx prisma/seed.ts`
   - Start Command: `npm run start`

2. **Railway.app / Fly.io / Koyeb**:
   - Alternatively, deploy using the included Dockerfile/Docker Compose configuration in `docker/docker-compose.yml`.
