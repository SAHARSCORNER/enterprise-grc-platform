import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Grid, List, AlertTriangle, X } from 'lucide-react';
import { apiFetch } from '../shared/api/apiClient';
import { Risk, SocketEvents } from '@grc/shared';
import { useSocketListener } from '../shared/hooks/useSocket';

export const RiskManagementPage: React.FC = () => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'register' | 'matrix'>('register');
  const [showModal, setShowModal] = useState(false);

  // New Risk state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [likelihood, setLikelihood] = useState(3);
  const [impact, setImpact] = useState(3);
  const [category, setCategory] = useState('Cybersecurity');
  const [mitigationPlan, setMitigationPlan] = useState('');

  const loadRisks = () => {
    setLoading(true);
    apiFetch<Risk[]>('/risks')
      .then((res) => setRisks(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRisks();
  }, []);

  useSocketListener(SocketEvents.RISK_CREATED, (newRisk: Risk) => {
    setRisks((prev) => [newRisk, ...prev]);
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/risks', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          likelihood,
          impact,
          category,
          mitigationPlan,
        }),
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      loadRisks();
    } catch (err) {
      alert(err);
    }
  };

  // Matrix cell risk score accumulator
  const getMatrixCellRisks = (l: number, imp: number) => {
    return risks.filter((r) => Number(r.likelihood) === l && Number(r.impact) === imp);
  };

  const getCellColor = (score: number) => {
    if (score >= 15) return 'bg-rose-950/80 border-rose-800 text-rose-300';
    if (score >= 8) return 'bg-amber-950/80 border-amber-800 text-amber-300';
    return 'bg-emerald-950/80 border-emerald-800 text-emerald-300';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Enterprise Risk Management</h1>
          <p className="text-xs text-slate-400 mt-1">Risk Register, 5x5 Heatmap Matrix, likelihood x impact score evaluation</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setActiveTab('register')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'register' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Risk Register</span>
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'matrix' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>5x5 Heatmap Matrix</span>
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Risk</span>
          </button>
        </div>
      </div>

      {activeTab === 'register' ? (
        <div className="glass-panel overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm animate-pulse">Loading Risk Register...</div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-850/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Risk ID</th>
                  <th className="p-4">Title & Description</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Likelihood x Impact</th>
                  <th className="p-4">Risk Score</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {risks.map((risk) => (
                  <tr key={risk.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-4 font-mono text-cyan-400 font-semibold">{risk.riskId}</td>
                    <td className="p-4">
                      <div className="font-medium text-slate-100">{risk.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{risk.description}</div>
                    </td>
                    <td className="p-4"><span className="px-2.5 py-1 bg-slate-800 rounded-lg text-slate-300 border border-slate-700/50">{risk.category}</span></td>
                    <td className="p-4 font-mono text-slate-300">{risk.likelihood} L × {risk.impact} I</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] ${
                        risk.score >= 15 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : risk.score >= 8 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {risk.score} / 25
                      </span>
                    </td>
                    <td className="p-4"><span className="px-2.5 py-1 bg-slate-800 rounded-lg text-slate-300 font-semibold">{risk.status}</span></td>
                    <td className="p-4 text-slate-400">{risk.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* 5x5 Heatmap Matrix */
        <div className="glass-panel p-6 space-y-4">
          <div className="text-center font-bold text-sm text-slate-200">5×5 Risk Matrix (Likelihood vs. Impact)</div>
          <div className="grid grid-cols-6 gap-2 text-center text-xs">
            <div className="p-2 font-semibold text-slate-400">Likelihood \ Impact</div>
            {[1, 2, 3, 4, 5].map((imp) => (
              <div key={imp} className="p-2 font-bold text-slate-300 bg-slate-900 border border-slate-800 rounded-lg">Impact {imp}</div>
            ))}

            {[5, 4, 3, 2, 1].map((lh) => (
              <React.Fragment key={lh}>
                <div className="p-2 font-bold text-slate-300 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center">
                  Lh {lh}
                </div>
                {[1, 2, 3, 4, 5].map((imp) => {
                  const cellScore = lh * imp;
                  const cellRisks = getMatrixCellRisks(lh, imp);
                  return (
                    <div key={imp} className={`p-3 rounded-xl border flex flex-col justify-between h-24 ${getCellColor(cellScore)}`}>
                      <div className="font-mono font-bold text-xs">Score {cellScore}</div>
                      <div className="text-lg font-extrabold">{cellRisks.length} Risks</div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Create Risk Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-semibold text-slate-100 text-sm">Register New Enterprise Risk</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Risk Title</label>
                <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea required rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Likelihood (1..5)</label>
                  <input type="number" min={1} max={5} value={likelihood} onChange={(e) => setLikelihood(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Impact (1..5)</label>
                  <input type="number" min={1} max={5} value={impact} onChange={(e) => setImpact(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Mitigation Plan</label>
                <textarea rows={2} value={mitigationPlan} onChange={(e) => setMitigationPlan(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none" />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-xl">Save Risk</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
