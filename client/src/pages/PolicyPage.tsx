import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, Users, Clock } from 'lucide-react';
import { apiFetch } from '../shared/api/apiClient';
import { Policy } from '@grc/shared';

export const PolicyPage: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Policy[]>('/policies')
      .then((res) => setPolicies(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Corporate Policy Management</h1>
          <p className="text-xs text-slate-400 mt-1">Policy repository, version control, review cycles, and employee acknowledgements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {policies.map((pol) => (
          <div key={pol.id} className="glass-panel p-5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="font-mono text-cyan-400 font-bold text-xs">{pol.policyCode}</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold">
                  v{pol.version} Approved
                </span>
              </div>
              <h3 className="font-bold text-slate-100 text-sm">{pol.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{pol.content}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Employee Acknowledgements</span>
                <span className="font-mono font-bold text-cyan-300">{pol.acknowledgementCount} / {pol.totalRequiredAcknowledgements}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500" style={{ width: `${(pol.acknowledgementCount / pol.totalRequiredAcknowledgements) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
