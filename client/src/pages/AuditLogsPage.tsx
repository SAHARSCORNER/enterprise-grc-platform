import React, { useState, useEffect } from 'react';
import { History, Shield, RefreshCw } from 'lucide-react';
import { apiFetch } from '../shared/api/apiClient';
import { AuditLogEntry, SocketEvents } from '@grc/shared';
import { useSocketListener } from '../shared/hooks/useSocket';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = () => {
    setLoading(true);
    apiFetch<AuditLogEntry[]>('/audit-logs')
      .then((res) => setLogs(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, []);

  useSocketListener(SocketEvents.AUDIT_LOG_NEW, (newLog: AuditLogEntry) => {
    setLogs((prev) => [newLog, ...prev]);
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Immutable System Audit Trail</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time log stream of all user actions, entity mutations, and IP addresses</p>
        </div>
        <button onClick={loadLogs} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-cyan-400">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm animate-pulse">Loading audit logs...</div>
        ) : (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-850/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Action</th>
                <th className="p-4">Module</th>
                <th className="p-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="p-4 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4 font-sans font-medium text-slate-200">{log.userName}</td>
                  <td className="p-4"><span className="px-2 py-0.5 bg-slate-800 rounded text-cyan-400 text-[10px]">{log.userRole}</span></td>
                  <td className="p-4 font-bold text-slate-100">{log.action}</td>
                  <td className="p-4 text-slate-300">{log.module}</td>
                  <td className="p-4 text-slate-500">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
