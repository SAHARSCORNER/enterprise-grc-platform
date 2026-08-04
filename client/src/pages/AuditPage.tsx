import React, { useState, useEffect } from 'react';
import { FileSearch, Plus, Calendar, CheckCircle2, Clock, AlertTriangle, Sparkles, Printer } from 'lucide-react';
import { apiFetch } from '../shared/api/apiClient';
import { Audit } from '@grc/shared';
import { AuditAnalyzerModal } from '../widgets/AuditAnalyzerModal';

export const AuditPage: React.FC = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnalyzerModal, setShowAnalyzerModal] = useState(false);

  useEffect(() => {
    apiFetch<Audit[]>('/audits')
      .then((res) => setAudits(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center space-x-2">
            <FileSearch className="w-6 h-6 text-cyan-400" />
            <span>Audit & Inspection Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Audit planning, evidence collection, findings, corrective actions, and ISO reporting</p>
        </div>

        <button
          onClick={() => setShowAnalyzerModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
          <span>ISO Audit Analyzer & Exporter</span>
        </button>
      </div>

      {/* Audits Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {audits.map((audit) => (
          <div key={audit.id} className="glass-panel p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-mono text-cyan-400 font-bold text-xs">{audit.auditCode}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  audit.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {audit.status}
              </span>
            </div>
            <h3 className="font-bold text-slate-100 text-sm">{audit.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{audit.scope}</p>

            <div className="text-xs text-slate-400 flex items-center space-x-4 pt-1">
              <span>Framework: <strong className="text-slate-200">{audit.framework}</strong></span>
              <span>Lead: <strong className="text-slate-200">{audit.leadAuditor}</strong></span>
            </div>

            {audit.findings && audit.findings.length > 0 && (
              <div className="mt-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="font-semibold text-rose-400 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Non-Conformities & Findings ({audit.findings.length})</span>
                </div>
                {audit.findings.map((f) => (
                  <div key={f.id} className="p-2 bg-slate-900 rounded border border-slate-850 text-[11px]">
                    <div className="font-medium text-slate-200">[{f.severity}] {f.title}</div>
                    <div className="text-slate-400 mt-0.5">Action: {f.correctiveAction}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Audit Analyzer & ISO Exporter Modal */}
      <AuditAnalyzerModal
        isOpen={showAnalyzerModal}
        onClose={() => setShowAnalyzerModal(false)}
      />
    </div>
  );
};
