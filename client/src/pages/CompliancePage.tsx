import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, AlertCircle, FileText, Cpu, ArrowRight } from 'lucide-react';
import { apiFetch } from '../shared/api/apiClient';
import { FrameworkSummary, Control } from '@grc/shared';

export const CompliancePage: React.FC = () => {
  const [frameworks, setFrameworks] = useState<FrameworkSummary[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [selectedFw, setSelectedFw] = useState<string>('ISO 27001');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch<FrameworkSummary[]>('/compliance/frameworks'),
      apiFetch<Control[]>(`/compliance/controls?framework=${encodeURIComponent(selectedFw)}`),
    ])
      .then(([fwRes, ctrlRes]) => {
        setFrameworks(fwRes);
        setControls(ctrlRes);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedFw]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Compliance & Framework Controls</h1>
          <p className="text-xs text-slate-400 mt-1">ISO 27001, SOC 2, NIST CSF, and CIS Controls security assurance dashboard</p>
        </div>
      </div>

      {/* Framework Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {frameworks.map((fw) => (
          <div
            key={fw.name}
            onClick={() => setSelectedFw(fw.name)}
            className={`glass-panel p-5 cursor-pointer transition-all ${
              selectedFw === fw.name ? 'border-cyan-500 bg-cyan-950/20 shadow-lg shadow-cyan-950/50' : 'hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-200">{fw.name}</span>
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Compliance Score</span>
                <span className="font-mono font-bold text-cyan-300">{fw.compliancePercentage}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${fw.compliancePercentage}%` }} />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 flex justify-between">
              <span>{fw.implemented} Implemented</span>
              <span>{fw.totalControls} Controls</span>
            </div>
          </div>
        ))}
      </div>

      {/* Controls Table */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-semibold text-slate-200">{selectedFw} Control Directory</h2>
          <span className="text-xs text-cyan-400 font-mono">{controls.length} Security Controls</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm animate-pulse">Loading compliance controls...</div>
        ) : (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-850/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3">Control Code</th>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3">Progress</th>
                <th className="p-3">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {controls.map((ctrl) => (
                <tr key={ctrl.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="p-3 font-mono text-cyan-400 font-semibold">{ctrl.controlCode}</td>
                  <td className="p-3 font-medium text-slate-100">{ctrl.title}</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-slate-800 rounded text-slate-300">{ctrl.category}</span></td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ctrl.status === 'IMPLEMENTED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {ctrl.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{ctrl.progress}%</td>
                  <td className="p-3 text-slate-400">{ctrl.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
