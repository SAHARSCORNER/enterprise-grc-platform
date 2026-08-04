import React, { useState, useEffect } from 'react';
import { Search, X, Users, HardDrive, ShieldAlert, FileText, FileSearch, Building2, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../shared/api/apiClient';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiFetch<any>(`/search?q=${encodeURIComponent(query)}`);
        setResults(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-start justify-center pt-20 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Global Search across Employees, Assets, Risks, Audits..."
            className="w-full bg-transparent text-slate-100 text-sm focus:outline-none placeholder-slate-500"
            autoFocus
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {loading && <div className="text-center py-6 text-slate-400 text-xs animate-pulse">Searching enterprise database...</div>}

          {!loading && !results && query.length < 2 && (
            <div className="text-center py-8 text-slate-500 text-xs">Type at least 2 characters to search across all modules.</div>
          )}

          {results && (
            <div className="space-y-4 text-xs">
              {/* Employees */}
              {results.employees?.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 text-cyan-400 font-semibold mb-2">
                    <Users className="w-4 h-4" />
                    <span>Employees</span>
                  </div>
                  <div className="space-y-1">
                    {results.employees.map((e: any) => (
                      <div key={e.id} className="p-2 bg-slate-850 hover:bg-slate-800 rounded-lg flex justify-between items-center">
                        <span className="text-slate-200">{e.firstName} {e.lastName} ({e.employeeCode})</span>
                        <span className="text-slate-400 text-[11px]">{e.department}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assets */}
              {results.assets?.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 text-blue-400 font-semibold mb-2">
                    <HardDrive className="w-4 h-4" />
                    <span>Assets</span>
                  </div>
                  <div className="space-y-1">
                    {results.assets.map((a: any) => (
                      <div key={a.id} className="p-2 bg-slate-850 hover:bg-slate-800 rounded-lg flex justify-between items-center">
                        <span className="text-slate-200">{a.name} [{a.assetTag}]</span>
                        <span className="text-slate-400 text-[11px]">{a.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risks */}
              {results.risks?.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 text-amber-400 font-semibold mb-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Risks</span>
                  </div>
                  <div className="space-y-1">
                    {results.risks.map((r: any) => (
                      <div key={r.id} className="p-2 bg-slate-850 hover:bg-slate-800 rounded-lg flex justify-between items-center">
                        <span className="text-slate-200">{r.riskId}: {r.title}</span>
                        <span className="text-amber-400 font-bold">Score {r.score}/25</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
