import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  ShieldAlert,
  HardDrive,
  UserX,
  Copy,
  Archive,
  RefreshCw,
  Trash2,
  Edit3,
  Network,
  Plus,
  Clock,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Employee, Asset, SocketEvents } from '@grc/shared';
import { apiFetch } from '../shared/api/apiClient';
import { useNavigate } from 'react-router-dom';

interface EmployeeProfileDrawerProps {
  employeeId: string | null;
  onClose: () => void;
  onEdit: (emp: Employee) => void;
  onRefresh: () => void;
}

export const EmployeeProfileDrawer: React.FC<EmployeeProfileDrawerProps> = ({
  employeeId,
  onClose,
  onEdit,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'hierarchy' | 'audit'>('overview');
  
  // Asset Assign State
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [selectedAssetToAssign, setSelectedAssetToAssign] = useState<string>('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const fetchDetails = async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const data = await apiFetch<any>(`/employees/${employeeId}`);
      setEmployee(data);
    } catch (err) {
      console.error('Failed to load employee details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [employeeId]);

  const loadAvailableAssets = async () => {
    try {
      const res = await apiFetch<Asset[]>('/assets');
      const unassigned = res.filter((a) => a.status === 'AVAILABLE' || !a.assignedEmployeeId);
      setAvailableAssets(unassigned);
    } catch (err) {
      console.error('Failed to fetch available assets:', err);
    }
  };

  const handleOpenAssignModal = () => {
    loadAvailableAssets();
    setShowAssignModal(true);
  };

  const handleAssignAsset = async () => {
    if (!selectedAssetToAssign || !employeeId) return;
    setAssigning(true);
    try {
      await apiFetch(`/employees/${employeeId}/assets/assign`, {
        method: 'POST',
        body: JSON.stringify({ assetId: selectedAssetToAssign }),
      });
      setShowAssignModal(false);
      setSelectedAssetToAssign('');
      fetchDetails();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to assign asset');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAsset = async (assetId: string) => {
    if (!employeeId || !confirm('Remove this asset from the employee?')) return;
    try {
      await apiFetch(`/employees/${employeeId}/assets/remove`, {
        method: 'POST',
        body: JSON.stringify({ assetId }),
      });
      fetchDetails();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to remove asset');
    }
  };

  const handleDuplicate = async () => {
    if (!employeeId) return;
    try {
      await apiFetch(`/employees/${employeeId}/duplicate`, { method: 'POST' });
      onRefresh();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate employee');
    }
  };

  const handleToggleArchive = async () => {
    if (!employeeId || !employee) return;
    const isArchived = employee.isArchived || employee.employmentStatus === 'ARCHIVED';
    const endpoint = isArchived ? `/employees/${employeeId}/restore` : `/employees/${employeeId}/archive`;
    try {
      await apiFetch(endpoint, { method: 'PATCH' });
      fetchDetails();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleDelete = async () => {
    if (!employeeId || !employee) return;
    if (
      !confirm(
        `Are you sure you want to PERMANENTLY DELETE employee "${employee.firstName} ${employee.lastName}" (${employee.employeeCode})?\n\nAll assigned assets will be released.`
      )
    ) {
      return;
    }
    try {
      await apiFetch(`/employees/${employeeId}`, { method: 'DELETE' });
      onRefresh();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to delete employee');
    }
  };

  if (!employeeId) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex justify-end transition-opacity animate-in fade-in">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-950/80 border-b border-slate-800 flex items-start justify-between relative">
          {loading ? (
            <div className="py-8 text-slate-400 animate-pulse text-sm">Loading employee profile...</div>
          ) : employee ? (
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
                {employee.firstName?.[0]}
                {employee.lastName?.[0]}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-slate-100">{employee.firstName} {employee.lastName}</h2>
                  <span className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 font-semibold">
                    {employee.employeeCode}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{employee.designation} &bull; {employee.department}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                    employee.isArchived || employee.employmentStatus === 'ARCHIVED'
                      ? 'bg-slate-800 text-slate-400 border border-slate-700'
                      : employee.employmentStatus === 'PENDING'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : employee.riskScore > 50
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {employee.isArchived ? 'ARCHIVED' : employee.employmentStatus}
                  </span>
                  <span className="text-[11px] text-slate-500">&bull;</span>
                  <span className="text-xs text-slate-400 font-mono">
                    Risk Score: <strong className={employee.riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'}>{employee.riskScore}/100</strong>
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        {employee && (
          <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between overflow-x-auto gap-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(employee)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 rounded-lg text-xs font-semibold border border-cyan-800/60 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={handleDuplicate}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>

              <button
                onClick={handleToggleArchive}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
              >
                {employee.isArchived || employee.employmentStatus === 'ARCHIVED' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Restore</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-3.5 h-3.5 text-amber-400" />
                    <span>Archive</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate('/graph');
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-800/60 transition-colors"
              >
                <Network className="w-3.5 h-3.5" />
                <span>View in Diagram</span>
              </button>
            </div>

            <button
              onClick={handleDelete}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-lg text-xs font-semibold border border-rose-800/60 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 flex space-x-6 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'assets'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Assigned Assets</span>
            <span className="px-1.5 py-0.5 bg-slate-800 rounded-full text-[10px] font-mono text-cyan-300">
              {employee?.assignedAssetCount || employee?.assets?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'hierarchy'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Hierarchy & Direct Reports
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit History
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm animate-pulse">Loading employee data...</div>
          ) : employee ? (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Contact & Personal Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-panel p-3.5 space-y-1">
                      <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium">
                        <Mail className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Corporate Email</span>
                      </div>
                      <p className="text-xs font-mono text-slate-200 font-medium select-all">{employee.email}</p>
                    </div>

                    <div className="glass-panel p-3.5 space-y-1">
                      <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium">
                        <Phone className="w-3.5 h-3.5 text-blue-400" />
                        <span>Phone Number</span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium">{employee.phone || 'Not provided'}</p>
                    </div>

                    <div className="glass-panel p-3.5 space-y-1">
                      <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium">
                        <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Department</span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium">{employee.department}</p>
                    </div>

                    <div className="glass-panel p-3.5 space-y-1">
                      <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>Office Location</span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium">{employee.officeLocation || 'Headquarters'}</p>
                    </div>

                    <div className="glass-panel p-3.5 space-y-1">
                      <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Joining Date</span>
                      </div>
                      <p className="text-xs font-mono text-slate-200 font-medium">{employee.joiningDate}</p>
                    </div>

                    <div className="glass-panel p-3.5 space-y-1">
                      <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>Exit Date</span>
                      </div>
                      <p className="text-xs font-mono text-slate-200 font-medium">{employee.terminationDate || 'Active'}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {employee.notes && (
                    <div className="glass-panel p-4 space-y-1.5 border-l-4 border-l-cyan-500">
                      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Notes & Remarks</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{employee.notes}</p>
                    </div>
                  )}

                  {/* Governance & Compliance Overview */}
                  <div className="glass-panel p-4 space-y-3">
                    <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>GRC & Risk Score Matrix</span>
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                        <span className="text-[11px] text-slate-400 block">Security Risk</span>
                        <span className={`text-lg font-bold font-mono ${employee.riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {employee.riskScore}/100
                        </span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                        <span className="text-[11px] text-slate-400 block">Assets Held</span>
                        <span className="text-lg font-bold font-mono text-cyan-400">
                          {employee.assignedAssetCount || 0}
                        </span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                        <span className="text-[11px] text-slate-400 block">Direct Reports</span>
                        <span className="text-lg font-bold font-mono text-blue-400">
                          {employee.directReports?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ASSETS TAB */}
              {activeTab === 'assets' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                        Assigned Enterprise Hardware & Accounts
                      </h3>
                      <p className="text-[11px] text-slate-400">Laptops, VPN, Keys, Accounts, Devices</p>
                    </div>
                    <button
                      onClick={handleOpenAssignModal}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Assign Asset</span>
                    </button>
                  </div>

                  {employee.assets && employee.assets.length > 0 ? (
                    <div className="space-y-2.5">
                      {employee.assets.map((asset: Asset) => (
                        <div
                          key={asset.id}
                          className="glass-panel p-3.5 flex items-center justify-between hover:border-slate-700 transition-all"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800">
                              <HardDrive className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="text-xs font-semibold text-slate-100">{asset.name}</h4>
                                <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-slate-300">
                                  {asset.assetTag}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Category: <strong className="text-slate-300">{asset.category}</strong> &bull; Serial: {asset.serialNumber}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {asset.status}
                            </span>
                            <button
                              onClick={() => handleRemoveAsset(asset.id)}
                              className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-lg text-[11px] font-medium border border-rose-800/50 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center glass-panel space-y-2">
                      <HardDrive className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400">No hardware or licenses currently assigned to this employee.</p>
                      <button
                        onClick={handleOpenAssignModal}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs rounded-xl border border-slate-700 font-semibold"
                      >
                        Assign Asset Now
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* HIERARCHY TAB */}
              {activeTab === 'hierarchy' && (
                <div className="space-y-6">
                  {/* Reporting Manager */}
                  <div className="glass-panel p-4 space-y-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Direct Reporting Manager</h4>
                    {employee.manager ? (
                      <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-950 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-800/50">
                            {employee.manager.firstName?.[0]}
                            {employee.manager.lastName?.[0]}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-100">
                              {employee.manager.firstName} {employee.manager.lastName}
                            </p>
                            <p className="text-[11px] text-slate-400">{employee.manager.designation} &bull; {employee.manager.email}</p>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] text-blue-400 bg-blue-950 px-2 py-1 rounded border border-blue-900">
                          {employee.manager.employeeCode}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic p-2">No reporting manager assigned (Top-Level Executive / Independent).</p>
                    )}
                  </div>

                  {/* Direct Reports */}
                  <div className="glass-panel p-4 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Subordinates & Direct Reports ({employee.directReports?.length || 0})
                    </h4>

                    {employee.directReports && employee.directReports.length > 0 ? (
                      <div className="space-y-2">
                        {employee.directReports.map((dr: any) => (
                          <div
                            key={dr.id}
                            className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-850 text-slate-300 font-bold text-xs flex items-center justify-center border border-slate-700">
                                {dr.firstName?.[0]}
                                {dr.lastName?.[0]}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-slate-200">{dr.firstName} {dr.lastName}</p>
                                <p className="text-[10px] text-slate-400">{dr.designation} &bull; {dr.department}</p>
                              </div>
                            </div>

                            <span className="font-mono text-[10px] text-cyan-400">{dr.employeeCode}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic p-2">This employee has no direct reports.</p>
                    )}
                  </div>
                </div>
              )}

              {/* AUDIT HISTORY TAB */}
              {activeTab === 'audit' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Audit Trail & Activity Log</span>
                  </h3>

                  {employee.auditHistory && employee.auditHistory.length > 0 ? (
                    <div className="relative border-l border-slate-800 ml-3 space-y-4 pl-4 py-2">
                      {employee.auditHistory.map((log: any) => (
                        <div key={log.id} className="relative text-xs">
                          <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-500 border border-slate-900" />
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{log.action}</span>
                            <span className="font-mono text-[10px] text-slate-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Performed by: <strong className="text-slate-300">{log.userName}</strong> ({log.userRole})
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic p-4 text-center">No recent audit log entries for this employee.</p>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* Assign Asset Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-slate-100 text-sm">Assign Asset to Employee</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block text-slate-400 font-medium">Select Available Enterprise Asset</label>
              <select
                value={selectedAssetToAssign}
                onChange={(e) => setSelectedAssetToAssign(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- Select Asset --</option>
                {availableAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.assetTag}) - [{asset.category}]
                  </option>
                ))}
              </select>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  disabled={!selectedAssetToAssign || assigning}
                  onClick={handleAssignAsset}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-cyan-600/20"
                >
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
