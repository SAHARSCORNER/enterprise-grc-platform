import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { apiFetch } from '../shared/api/apiClient';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importSummary, setImportSummary] = useState<any | null>(null);

  if (!isOpen) return null;

  // Simple robust CSV parser handling quotes
  const parseCSVText = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];

    const parseLine = (line: string) => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.length < 3) continue;
      const rowObj: any = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] !== undefined ? values[idx] : '';
      });
      data.push(rowObj);
    }
    return data;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const rows = parseCSVText(content);
        setParsedRows(rows);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/v1/employees/template/csv');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'employee_bulk_import_template.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to download template');
    }
  };

  const handleImportSubmit = async () => {
    if (parsedRows.length === 0) return;
    setLoading(true);
    try {
      const result = await apiFetch<any>('/employees/bulk-import', {
        method: 'POST',
        body: JSON.stringify({
          employees: parsedRows,
          overwriteExisting,
        }),
      });
      setImportSummary(result);
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Bulk import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center border border-cyan-800/60">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Bulk Employee Import (CSV / XLSX)</h3>
              <p className="text-xs text-slate-400">Import workforce records, auto-generate graph nodes, and sync database</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 bg-slate-800 hover:bg-slate-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Action Header */}
          <div className="flex items-center justify-between glass-panel p-4">
            <div>
              <h4 className="text-xs font-semibold text-slate-200">Download Standard Import Template</h4>
              <p className="text-[11px] text-slate-400">Use pre-formatted CSV template to ensure data compatibility</p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* Upload Area */}
          {!importSummary && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-950/50 rounded-2xl p-6 text-center space-y-3 transition-all">
                <Upload className="w-8 h-8 text-cyan-400 mx-auto" />
                <div>
                  <label htmlFor="csv-file-input" className="cursor-pointer text-xs font-semibold text-cyan-400 hover:underline">
                    Click to select CSV or XLSX file
                  </label>
                  <p className="text-[11px] text-slate-500 mt-1">Supported formats: CSV, XLSX, TSV</p>
                </div>
                <input
                  id="csv-file-input"
                  type="file"
                  accept=".csv,.xlsx,.tsv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file && (
                  <p className="text-xs font-mono text-emerald-400 bg-emerald-950/50 px-3 py-1 rounded-lg inline-block border border-emerald-900">
                    Selected File: {file.name} ({parsedRows.length} rows detected)
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="flex items-center space-x-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <input
                  id="overwrite-check"
                  type="checkbox"
                  checked={overwriteExisting}
                  onChange={(e) => setOverwriteExisting(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-0"
                />
                <label htmlFor="overwrite-check" className="text-xs text-slate-300 cursor-pointer">
                  Update existing employee records if Email or Employee Code already exists
                </label>
              </div>

              {/* Parsed Rows Preview */}
              {parsedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-300">File Preview & Data Validation</h4>
                    <span className="text-[11px] font-mono text-cyan-400">{parsedRows.length} Records</span>
                  </div>
                  <div className="glass-panel overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px] text-slate-300">
                      <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                        <tr>
                          <th className="p-2.5">Row</th>
                          <th className="p-2.5">Code</th>
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5">Email</th>
                          <th className="p-2.5">Department</th>
                          <th className="p-2.5">Designation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {parsedRows.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-850/50">
                            <td className="p-2.5 text-slate-500">{idx + 1}</td>
                            <td className="p-2.5 text-cyan-400">{row['Employee Code'] || row.employeeCode || `EMP-${1001 + idx}`}</td>
                            <td className="p-2.5 text-slate-100">
                              {row['First Name'] || row.firstName} {row['Last Name'] || row.lastName}
                            </td>
                            <td className="p-2.5 text-slate-300">{row['Email'] || row.email}</td>
                            <td className="p-2.5">{row['Department'] || row.department}</td>
                            <td className="p-2.5 text-slate-400">{row['Designation'] || row.designation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Import Summary Results */}
          {importSummary && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-5 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Bulk Import Execution Summary</span>
                </div>

                <div className="grid grid-cols-4 gap-3 text-center pt-2">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">New Added</span>
                    <span className="text-xl font-bold font-mono text-emerald-400">{importSummary.added}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Updated</span>
                    <span className="text-xl font-bold font-mono text-cyan-400">{importSummary.updated}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Skipped</span>
                    <span className="text-xl font-bold font-mono text-amber-400">{importSummary.skipped}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Rejected</span>
                    <span className="text-xl font-bold font-mono text-rose-400">{importSummary.rejected?.length || 0}</span>
                  </div>
                </div>
              </div>

              {importSummary.rejected && importSummary.rejected.length > 0 && (
                <div className="glass-panel p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-rose-400 flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Rejected Records & Validation Issues</span>
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-1 text-xs">
                    {importSummary.rejected.map((item: any, idx: number) => (
                      <div key={idx} className="bg-slate-950 p-2 rounded border border-rose-900/40 text-slate-300 flex justify-between">
                        <span>Row {item.row}: {item.email || 'Record'}</span>
                        <span className="text-rose-400 font-mono text-[11px]">{item.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl">
            {importSummary ? 'Close Window' : 'Cancel'}
          </button>
          {!importSummary && (
            <button
              disabled={parsedRows.length === 0 || loading}
              onClick={handleImportSubmit}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/20"
            >
              {loading ? 'Importing Records...' : `Import ${parsedRows.length} Employees`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
