import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { initSocketServer } from './infrastructure/socket';
import { authenticateJWT } from './presentation/middlewares/authMiddleware';
import { prisma } from './infrastructure/prisma';

import authRoutes from './presentation/routes/authRoutes';
import dashboardRoutes from './presentation/routes/dashboardRoutes';
import employeeRoutes from './presentation/routes/employeeRoutes';
import assetRoutes from './presentation/routes/assetRoutes';
import graphRoutes from './presentation/routes/graphRoutes';
import riskRoutes from './presentation/routes/riskRoutes';
import complianceRoutes from './presentation/routes/complianceRoutes';
import auditRoutes from './presentation/routes/auditRoutes';
import vendorRoutes from './presentation/routes/vendorRoutes';
import incidentRoutes from './presentation/routes/incidentRoutes';
import policyRoutes from './presentation/routes/policyRoutes';
import aiRoutes from './presentation/routes/aiRoutes';
import reportRoutes from './presentation/routes/reportRoutes';
import searchRoutes from './presentation/routes/searchRoutes';
import auditLogRoutes from './presentation/routes/auditLogRoutes';
import notificationRoutes from './presentation/routes/notificationRoutes';
import ticketRoutes from './presentation/routes/ticketRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const server = http.createServer(app);
const io = initSocketServer(server);

// Public API Routes
app.use('/api/v1/auth', authRoutes);

// Protected API Routes (Direct SQLite DB Connectivity)
app.use('/api/v1/dashboard', authenticateJWT, dashboardRoutes);
app.use('/api/v1/employees', authenticateJWT, employeeRoutes);
app.use('/api/v1/assets', authenticateJWT, assetRoutes);
app.use('/api/v1/graph', authenticateJWT, graphRoutes);
app.use('/api/v1/risks', authenticateJWT, riskRoutes);
app.use('/api/v1/compliance', authenticateJWT, complianceRoutes);
app.use('/api/v1/audits', authenticateJWT, auditRoutes);
app.use('/api/v1/vendors', authenticateJWT, vendorRoutes);
app.use('/api/v1/incidents', authenticateJWT, incidentRoutes);
app.use('/api/v1/policies', authenticateJWT, policyRoutes);
app.use('/api/v1/ai', authenticateJWT, aiRoutes);
app.use('/api/v1/reports', authenticateJWT, reportRoutes);
app.use('/api/v1/search', authenticateJWT, searchRoutes);
app.use('/api/v1/audit-logs', authenticateJWT, auditLogRoutes);
app.use('/api/v1/notifications', authenticateJWT, notificationRoutes);
app.use('/api/v1/tickets', authenticateJWT, ticketRoutes);

// Health Check Endpoint
app.get('/health', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({
      status: 'healthy',
      database: 'connected (SQLite dev.db)',
      recordCount: { users: userCount },
      timestamp: new Date().toISOString(),
      socketClients: io.engine.clientsCount,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// Single Unit Web App Serving (Vite Client Static Bundle & SPA Fallback)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  console.log('ℹ️ Client build directory not found. Access API endpoints on /api/v1 or run npm run build.');
}

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🛡️  ENTERPRISE GRC SINGLE UNIFIED SYSTEM INITIALIZED`);
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`🗄️  Prisma DB Engine connected to SQLite dev.db`);
  console.log(`🔌 Socket.IO Real-time Engine active`);
  console.log(`======================================================\n`);
});
