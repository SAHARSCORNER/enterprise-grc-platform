import React from 'react';
import { FileDown, FileText, Download, CheckCircle2 } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const reports = [
    { title: 'Executive GRC Overview Report', type: 'executive', desc: 'Comprehensive summary of enterprise risks, asset allocations, and compliance percentages.' },
    { title: 'Risk Register & Heatmap Report', type: 'risk', desc: 'Complete breakdown of all 100+ tracked risks, likelihood x impact scores, and mitigation status.' },
    { title: 'Enterprise Asset Inventory Export', type: 'asset', desc: 'Detailed serial number, warranty, category, and employee assignment list.' },
    { title: 'Employee Governance Directory', type: 'employee', desc: 'Workforce records, designations, department risk scores, and equipment counts.' },
  ];

  const downloadPdf = (type: string) => {
    window.open(`/api/v1/reports/pdf?type=${type}`, '_blank');
  };

  const downloadCsv = (type: string) => {
    window.open(`/api/v1/reports/csv?type=${type}`, '_blank');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Enterprise PDF & CSV Export Reports</h1>
          <p className="text-xs text-slate-400 mt-1">Generate print-ready governance compliance documentation and raw data spreadsheets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((r) => (
          <div key={r.type} className="glass-panel p-6 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{r.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => downloadPdf(r.type)}
                className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-semibold rounded-xl text-xs shadow-lg shadow-cyan-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={() => downloadCsv(r.type)}
                className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
