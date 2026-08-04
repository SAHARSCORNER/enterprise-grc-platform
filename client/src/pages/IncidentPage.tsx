import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { apiFetch } from '../shared/api/apiClient';
import { Incident } from '@grc/shared';

export const IncidentPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Incident[]>('/incidents')
      .then((res) => setIncidents(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Security Incident Management</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time incident response, severity classification, root-cause analysis, and timeline</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {incidents.map((inc) => (
          <div key={inc.id} className="glass-panel p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-mono text-cyan-400 font-bold text-xs">{inc.incidentCode}</span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                inc.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {inc.severity} Severity
              </span>
            </div>
            <h3 className="font-bold text-slate-100 text-sm">{inc.title}</h3>
            <p className="text-xs text-slate-400">{inc.description}</p>
            {inc.rootCause && (
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
                <span className="font-semibold text-cyan-300">Root Cause:</span>
                <span className="text-slate-300 ml-1">{inc.rootCause}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
              <span>Owner: {inc.owner}</span>
              <span className="font-mono">{new Date(inc.reportedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
