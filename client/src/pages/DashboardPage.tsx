import React, { useEffect, useState, useCallback } from 'react';
import { Users, HardDrive, ShieldAlert, CheckCircle2, FileSearch, AlertTriangle, Building2, TrendingUp, History } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { apiFetch } from '../shared/api/apiClient';
import { ExecutiveDashboardKPIs, SocketEvents } from '@grc/shared';
import { useSocketListener } from '../shared/hooks/useSocket';

const COLORS = ['#0284c7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const FALLBACK_KPIS: ExecutiveDashboardKPIs = {
  totalEmployees: 100,
  totalAssets: 500,
  highRiskAssetsCount: 14,
  compliancePercentage: 92,
  openRisksCount: 8,
  pendingAuditsCount: 3,
  activeIncidentsCount: 2,
  activeVendorsCount: 45,
  complianceTrend: [
    { month: 'Jan', percentage: 78 },
    { month: 'Feb', percentage: 82 },
    { month: 'Mar', percentage: 85 },
    { month: 'Apr', percentage: 88 },
    { month: 'May', percentage: 90 },
    { month: 'Jun', percentage: 92 },
  ],
  assetCategoryDistribution: [
    { category: 'Laptops & Workstations', count: 240 },
    { category: 'Cloud Servers', count: 120 },
    { category: 'Mobile Devices', count: 85 },
    { category: 'Network Routers', count: 35 },
    { category: 'Database Clusters', count: 20 },
  ],
  riskTrend: [
    { date: 'W1', low: 18, medium: 9, high: 2 },
    { date: 'W2', low: 22, medium: 11, high: 3 },
    { date: 'W3', low: 25, medium: 10, high: 2 },
    { date: 'W4', low: 28, medium: 8, high: 1 },
  ],
  recentActivities: [
    { id: '1', timestamp: new Date().toISOString(), userId: 'u-1', userName: 'Sarah Jenkins', userRole: 'COMPLIANCE_OFFICER' as any, action: 'ISO 27001 Control A.12 Evaluated', module: 'compliance', ipAddress: '192.168.1.45' },
    { id: '2', timestamp: new Date(Date.now() - 3600000).toISOString(), userId: 'u-2', userName: 'David Chen', userRole: 'ADMINISTRATOR' as any, action: 'New Cloud Server Asset Registered', module: 'assets', ipAddress: '192.168.1.12' },
    { id: '3', timestamp: new Date(Date.now() - 7200000).toISOString(), userId: 'u-3', userName: 'Elena Rostova', userRole: 'AUDITOR' as any, action: 'Q3 SOC 2 Audit Initiated', module: 'audits', ipAddress: '192.168.1.88' },
  ],
};

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<ExecutiveDashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchKPIs = useCallback(() => {
    apiFetch<ExecutiveDashboardKPIs>('/dashboard/kpis')
      .then((res) => {
        setData(res);
        setIsDemoMode(false);
      })
      .catch((err) => {
        console.warn('Backend API unreachable, using fallback GRC metrics:', err);
        setData(FALLBACK_KPIS);
        setIsDemoMode(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs]);

  // Live Socket.IO Listeners for Real-time Dashboard Updates
  useSocketListener(SocketEvents.EMPLOYEE_CREATED, () => fetchKPIs());
  useSocketListener(SocketEvents.EMPLOYEE_DELETED, () => fetchKPIs());
  useSocketListener(SocketEvents.ASSET_CREATED, () => fetchKPIs());
  useSocketListener(SocketEvents.ASSET_DELETED, () => fetchKPIs());
  useSocketListener(SocketEvents.ASSET_ASSIGNED, () => fetchKPIs());
  useSocketListener(SocketEvents.ASSET_REMOVED, () => fetchKPIs());
  useSocketListener(SocketEvents.AUDIT_COMPLETED, () => fetchKPIs());
  useSocketListener(SocketEvents.TICKET_CREATED, () => fetchKPIs());

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-400 text-sm animate-pulse">Loading Executive Dashboard KPIs...</div>;
  }

  const kpiCards = [
    { label: 'Total Employees', value: data.totalEmployees, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Total Enterprise Assets', value: data.totalAssets, icon: HardDrive, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'High Risk Assets', value: data.highRiskAssetsCount, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Overall Compliance', value: `${data.compliancePercentage}%`, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Open Security Risks', value: data.openRisksCount, icon: ShieldAlert, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Pending Audits', value: data.pendingAuditsCount, icon: FileSearch, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Executive GRC Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time Enterprise Governance, Risk, & Compliance Overview</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{isDemoMode ? 'Interactive Showcase Feed' : 'Live WebSocket Feed'}</span>
        </div>
      </div>

      {isDemoMode && (
        <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs px-4 py-2 rounded-xl flex items-center justify-between">
          <span>⚡ <strong>Interactive Showcase Mode:</strong> Displaying structured GRC metrics. Deploy backend server to stream live DB state.</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-panel p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">{card.label}</span>
                <div className={`p-2 rounded-xl ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-100 mt-2 font-mono">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Trend Chart */}
        <div className="glass-panel p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Compliance Trend (6 Months)</span>
            </h2>
            <span className="text-xs text-slate-400">ISO 27001 / SOC 2</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.complianceTrend}>
                <defs>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="percentage" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorComp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Distribution */}
        <div className="glass-panel p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200">Asset Category Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.assetCategoryDistribution} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={75} label>
                  {data.assetCategoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Trend & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-5 lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200">Risk Severity Breakdown</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.riskTrend}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="low" fill="#10b981" stackId="a" />
                <Bar dataKey="medium" fill="#f59e0b" stackId="a" />
                <Bar dataKey="high" fill="#ef4444" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="glass-panel p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Recent Activity Feed</span>
            </h2>
          </div>
          <div className="space-y-3 max-h-56 overflow-y-auto text-xs">
            {data.recentActivities.map((act) => (
              <div key={act.id} className="p-2.5 bg-slate-850/80 rounded-lg border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-cyan-300">{act.action}</span>
                  <span className="text-[10px] text-slate-500">{new Date(act.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-slate-400 text-[11px]">{act.userName} ({act.userRole})</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
