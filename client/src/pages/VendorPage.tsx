import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { apiFetch } from '../shared/api/apiClient';
import { Vendor } from '@grc/shared';

export const VendorPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Vendor[]>('/vendors')
      .then((res) => setVendors(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Third-Party Vendor Risk Management</h1>
          <p className="text-xs text-slate-400 mt-1">Vendor security questionnaires, risk levels, SOC 2 certificates, and contract expiries</p>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm animate-pulse">Loading vendor database...</div>
        ) : (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-850/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Vendor Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4">Questionnaire</th>
                <th className="p-4">Contract Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {vendors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="p-4 font-bold text-slate-100">{v.name}</td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-slate-800 rounded-lg text-slate-300 border border-slate-700/50">{v.category}</span></td>
                  <td className="p-4">
                    <div>{v.contactName}</div>
                    <div className="text-[10px] text-slate-400">{v.contactEmail}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] ${
                      v.riskScore > 70 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : v.riskScore > 40 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {v.riskScore} / 100 ({v.riskLevel})
                    </span>
                  </td>
                  <td className="p-4">
                    {v.securityQuestionnaireCompleted ? (
                      <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="text-amber-400 italic">Pending</span>
                    )}
                  </td>
                  <td className="p-4 font-mono text-slate-300">{v.contractExpiryDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
