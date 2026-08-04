import React, { useState } from 'react';
import { X, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Download, Printer, FileSearch, Sparkles } from 'lucide-react';

interface AuditAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditData?: any;
}

export const AuditAnalyzerModal: React.FC<AuditAnalyzerModalProps> = ({ isOpen, onClose, auditData }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(true);

  if (!isOpen) return null;

  const handleExportISOPrint = () => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;

    const reportContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ISO 27001:2022 Certified Information Security Audit Report</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #0f172a; margin: 40px; line-height: 1.6; }
          .header { border-bottom: 3px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
          .logo-text { font-size: 24px; font-weight: bold; color: #0369a1; letter-spacing: 1px; }
          .sub-logo { font-size: 12px; color: #64748b; font-family: monospace; }
          .stamp { border: 2px solid #059669; color: #059669; padding: 6px 12px; font-weight: bold; font-size: 12px; border-radius: 6px; text-transform: uppercase; letter-spacing: 1px; }
          .section-title { font-size: 16px; font-weight: bold; color: #0f172a; border-left: 4px solid #0284c7; padding-left: 10px; margin-top: 30px; margin-bottom: 15px; text-transform: uppercase; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; rounded-radius: 8px; }
          .card-label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
          .card-val { font-size: 14px; color: #0f172a; font-weight: bold; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
          th { background: #0f172a; color: #ffffff; padding: 10px; text-align: left; font-weight: 600; }
          td { border-bottom: 1px solid #e2e8f0; padding: 10px; }
          .badge-major { background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; }
          .badge-minor { background: #fef3c7; color: #92400e; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; }
          .signature-section { margin-top: 50px; border-top: 1px solid #cbd5e1; padding-top: 20px; display: flex; justify-content: space-between; }
          .sig-box { width: 220px; text-align: center; }
          .sig-line { border-bottom: 1px dashed #64748b; margin-bottom: 8px; height: 40px; }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer;">Print / Save as PDF</button>
        </div>

        <div class="header">
          <div>
            <div class="logo-text">GLOBAL ENTERPRISE GRC PLATFORM</div>
            <div class="sub-logo">ISO/IEC 27001:2022 CERTIFIED AUDIT REPORT &bull; REF: AUD-2026-ISO-01</div>
          </div>
          <div class="stamp">ISO 27001 COMPLIANT CERTIFIED</div>
        </div>

        <div class="section-title">1. Executive Summary & Assessment Scope</div>
        <p style="font-size: 12px; color: #334155;">
          This official Information Security Management System (ISMS) audit report documents compliance against the ISO/IEC 27001:2022 standard requirements and Annex A security controls. The assessment evaluated enterprise infrastructure, user authentication controls, asset segregation, and vulnerability response protocols.
        </p>

        <div class="grid">
          <div class="card">
            <div class="card-label">Target Assessment Scope</div>
            <div class="card-val">Production Infrastructure, Data Centers & IAM Access</div>
          </div>
          <div class="card">
            <div class="card-label">Assessment Standard</div>
            <div class="card-val">ISO/IEC 27001:2022 / ISO 19011 Guidelines</div>
          </div>
          <div class="card">
            <div class="card-label">Overall Compliance Rate</div>
            <div class="card-val" style="color: #059669;">94.2% Satisfactory</div>
          </div>
          <div class="card">
            <div class="card-label">Lead Certified Auditor</div>
            <div class="card-val">Arthur Auditor (IRCA Cert #89012)</div>
          </div>
        </div>

        <div class="section-title">2. Statement of Applicability (SoA) Control Evaluation</div>
        <table>
          <thead>
            <tr>
              <th>ISO Control Code</th>
              <th>Control Description</th>
              <th>Status</th>
              <th>Compliance Score</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>A.5.15</strong></td>
              <td>Access Control & Identity Management</td>
              <td>Implemented</td>
              <td>98%</td>
            </tr>
            <tr>
              <td><strong>A.8.1</strong></td>
              <td>User Endpoint & Hardware Asset Inventory</td>
              <td>Implemented</td>
              <td>100%</td>
            </tr>
            <tr>
              <td><strong>A.8.20</strong></td>
              <td>Network Security & Perimeter Firewalls</td>
              <td>Partially Implemented</td>
              <td>85%</td>
            </tr>
            <tr>
              <td><strong>A.5.24</strong></td>
              <td>Information Security Incident Management</td>
              <td>Implemented</td>
              <td>95%</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">3. Audit Non-Conformities & Corrective Action Matrix</div>
        <table>
          <thead>
            <tr>
              <th>Finding Code</th>
              <th>Non-Conformity Description</th>
              <th>Severity Level</th>
              <th>Mandatory Corrective Action</th>
              <th>Target Closure</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>NC-01</strong></td>
              <td>Staging VPN Endpoint lacks enforced MFA for contractor accounts.</td>
              <td><span class="badge-major font-bold">MAJOR NC</span></td>
              <td>Enforce mandatory SSO/MFA policies on all UAT/Staging VPN gateways.</td>
              <td>2026-02-28</td>
            </tr>
            <tr>
              <td><strong>NC-02</strong></td>
              <td>Quarterly privilege access review sign-off delayed by 14 days.</td>
              <td><span class="badge-minor font-bold">MINOR NC</span></td>
              <td>Automate privilege access review reminders via GRC Ticket Engine.</td>
              <td>2026-03-15</td>
            </tr>
          </tbody>
        </table>

        <div class="signature-section">
          <div class="sig-box">
            <div class="sig-line"></div>
            <div style="font-size: 11px; font-weight: bold;">Arthur Auditor</div>
            <div style="font-size: 10px; color: #64748b;">Lead ISMS Auditor, IRCA</div>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <div style="font-size: 11px; font-weight: bold;">Helena Blackwood</div>
            <div style="font-size: 10px; color: #64748b;">Chief Information Security Officer</div>
          </div>
        </div>
      </body>
      </html>
    `;

    reportWindow.document.write(reportContent);
    reportWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                <span>ISO Audit Analyzer & Compliance Inspector</span>
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              </h3>
              <p className="text-xs text-slate-400">Automated ISO 27001 non-conformity detection, control verification & PDF export</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 bg-slate-800 hover:bg-slate-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Executive Score Card */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">ISO 27001 Score</span>
              <span className="text-xl font-bold font-mono text-emerald-400">94.2%</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Evaluated Controls</span>
              <span className="text-xl font-bold font-mono text-cyan-400">114 / 114</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Major Non-Conformities</span>
              <span className="text-xl font-bold font-mono text-rose-400">1</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Minor Non-Conformities</span>
              <span className="text-xl font-bold font-mono text-amber-400">1</span>
            </div>
          </div>

          {/* Non-Conformities Table Preview */}
          <div className="glass-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-xs">
                Analyzed Non-Conformities & Findings
              </h4>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono text-[10px]">
                ISO 19011 Standard
              </span>
            </div>

            <div className="space-y-2">
              <div className="bg-slate-950 p-3 rounded-xl border border-rose-900/40 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-950 text-rose-300 border border-rose-800">
                      MAJOR NC
                    </span>
                    <h5 className="font-semibold text-slate-100">MFA Enforcement Exemption on Staging VPN Endpoint</h5>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Staging VPN gateway lacks mandatory MFA enforcement for 3 external contractor accounts.
                  </p>
                </div>
                <span className="font-mono text-[10px] text-slate-500">Due: 2026-02-28</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-amber-900/40 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-950 text-amber-300 border border-amber-800">
                      MINOR NC
                    </span>
                    <h5 className="font-semibold text-slate-100">Quarterly Access Rights Review Log Delay</h5>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Q4 2025 privilege access review sign-off was completed 14 days past scheduled deadline.
                  </p>
                </div>
                <span className="font-mono text-[10px] text-slate-500">Due: 2026-03-15</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-slate-500 text-[11px] font-mono">Certified Format Generator • ISO 27001:2022</span>

          <div className="flex items-center space-x-3">
            <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl">
              Close Preview
            </button>
            <button
              onClick={handleExportISOPrint}
              className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Export ISO Certified Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
