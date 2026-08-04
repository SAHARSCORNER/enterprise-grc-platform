import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  HardDrive,
  ShieldAlert,
  X,
  FileSpreadsheet,
  Download,
  Copy,
  Archive,
  RefreshCw,
  Trash2,
  Edit3,
  Eye,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import { apiFetch } from '../shared/api/apiClient';
import { Employee, SocketEvents, EmploymentStatus } from '@grc/shared';
import { useSocketListener } from '../shared/hooks/useSocket';
import { EmployeeProfileDrawer } from '../widgets/EmployeeProfileDrawer';
import { BulkImportModal } from '../widgets/BulkImportModal';

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Modals & Drawers State
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [confirmDeleteEmp, setConfirmDeleteEmp] = useState<Employee | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deptForm, setDeptForm] = useState('Engineering');
  const [desigForm, setDesigForm] = useState('Software Engineer');
  const [managerIdForm, setManagerIdForm] = useState('');
  const [officeForm, setOfficeForm] = useState('Headquarters (New York)');
  const [statusForm, setStatusForm] = useState<EmploymentStatus>(EmploymentStatus.FULL_TIME);
  const [joiningDateForm, setJoiningDateForm] = useState(new Date().toISOString().split('T')[0]);
  const [terminationDateForm, setTerminationDateForm] = useState('');
  const [riskScoreForm, setRiskScoreForm] = useState(10);
  const [notesForm, setNotesForm] = useState('');

  const loadEmployees = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (department) params.append('department', department);
    if (statusFilter) params.append('status', statusFilter);
    if (riskFilter) params.append('riskLevel', riskFilter);
    if (showArchived) params.append('showArchived', 'true');

    apiFetch<Employee[]>(`/employees?${params.toString()}`)
      .then((res) => setEmployees(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [search, department, statusFilter, riskFilter, showArchived]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Real-time Socket.IO Listeners
  useSocketListener(SocketEvents.EMPLOYEE_CREATED, () => loadEmployees());
  useSocketListener(SocketEvents.EMPLOYEE_UPDATED, () => loadEmployees());
  useSocketListener(SocketEvents.EMPLOYEE_DELETED, () => loadEmployees());
  useSocketListener(SocketEvents.EMPLOYEE_ARCHIVED, () => loadEmployees());
  useSocketListener(SocketEvents.EMPLOYEE_RESTORED, () => loadEmployees());
  useSocketListener(SocketEvents.EMPLOYEE_MANAGER_CHANGED, () => loadEmployees());
  useSocketListener(SocketEvents.EMPLOYEE_DUPLICATED, () => loadEmployees());
  useSocketListener(SocketEvents.EMPLOYEE_BULK_IMPORTED, () => loadEmployees());
  useSocketListener(SocketEvents.ASSET_ASSIGNED, () => loadEmployees());
  useSocketListener(SocketEvents.ASSET_REMOVED, () => loadEmployees());

  const resetForm = () => {
    setEditingEmp(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setDeptForm('Engineering');
    setDesigForm('Software Engineer');
    setManagerIdForm('');
    setOfficeForm('Headquarters (New York)');
    setStatusForm(EmploymentStatus.FULL_TIME);
    setJoiningDateForm(new Date().toISOString().split('T')[0]);
    setTerminationDateForm('');
    setRiskScoreForm(10);
    setNotesForm('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowFormModal(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setFirstName(emp.firstName || '');
    setLastName(emp.lastName || '');
    setEmail(emp.email || '');
    setPhone(emp.phone || '');
    setDeptForm(emp.department || 'Engineering');
    setDesigForm(emp.designation || '');
    setManagerIdForm(emp.managerId || '');
    setOfficeForm(emp.officeLocation || 'Headquarters (New York)');
    setStatusForm(emp.employmentStatus || EmploymentStatus.FULL_TIME);
    setJoiningDateForm(emp.joiningDate || new Date().toISOString().split('T')[0]);
    setTerminationDateForm(emp.terminationDate || '');
    setRiskScoreForm(emp.riskScore || 10);
    setNotesForm(emp.notes || '');
    setShowFormModal(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        firstName,
        lastName,
        email,
        phone,
        department: deptForm,
        designation: desigForm,
        managerId: managerIdForm || null,
        officeLocation: officeForm,
        employmentStatus: statusForm,
        joiningDate: joiningDateForm,
        terminationDate: terminationDateForm || null,
        riskScore: riskScoreForm,
        notes: notesForm,
      };

      if (editingEmp) {
        await apiFetch(`/employees/${editingEmp.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/employees', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setShowFormModal(false);
      resetForm();
      loadEmployees();
    } catch (err: any) {
      alert(err.message || 'Failed to save employee record');
    }
  };

  const handleDuplicate = async (emp: Employee) => {
    try {
      await apiFetch(`/employees/${emp.id}/duplicate`, { method: 'POST' });
      loadEmployees();
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate employee');
    }
  };

  const handleToggleArchive = async (emp: Employee) => {
    const isArchived = emp.isArchived || emp.employmentStatus === EmploymentStatus.ARCHIVED;
    const endpoint = isArchived ? `/employees/${emp.id}/restore` : `/employees/${emp.id}/archive`;
    try {
      await apiFetch(endpoint, { method: 'PATCH' });
      loadEmployees();
    } catch (err: any) {
      alert(err.message || 'Failed action');
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDeleteEmp) return;
    try {
      await apiFetch(`/employees/${confirmDeleteEmp.id}`, { method: 'DELETE' });
      setConfirmDeleteEmp(null);
      loadEmployees();
    } catch (err: any) {
      alert(err.message || 'Failed to delete employee');
    }
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>Employee Directory & Governance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise workforce management, asset assignments, and real-time network topology sync
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
            title="Download CSV Template"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">CSV Template</span>
          </button>

          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Bulk Import</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 glass-panel p-3.5">
        {/* Search */}
        <div className="md:col-span-2 flex items-center space-x-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, email, designation..."
            className="bg-transparent text-xs text-slate-100 focus:outline-none w-full"
          />
        </div>

        {/* Department Filter */}
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="bg-slate-950 text-xs text-slate-300 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
        >
          <option value="">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Cybersecurity">Cybersecurity</option>
          <option value="IT Operations">IT Operations</option>
          <option value="Human Resources">Human Resources</option>
          <option value="Finance & Accounting">Finance & Accounting</option>
          <option value="Legal & Compliance">Legal & Compliance</option>
          <option value="Executive Leadership">Executive Leadership</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 text-xs text-slate-300 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
        >
          <option value="">All Employment Statuses</option>
          <option value="FULL_TIME">Full Time</option>
          <option value="PART_TIME">Part Time</option>
          <option value="CONTRACTOR">Contractor</option>
          <option value="INTERN">Intern</option>
          <option value="PENDING">Pending</option>
          <option value="INACTIVE">Inactive</option>
          <option value="TERMINATED">Terminated</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        {/* Risk Level Filter */}
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="bg-slate-950 text-xs text-slate-300 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
        >
          <option value="">All Risk Levels</option>
          <option value="LOW">Low Risk (0-20)</option>
          <option value="MEDIUM">Medium Risk (21-50)</option>
          <option value="HIGH">High Risk (51-80)</option>
          <option value="CRITICAL">Critical Risk (81-100)</option>
        </select>

        {/* Show Archived Checkbox Toggle */}
        <div className="flex items-center space-x-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
          <input
            id="show-archived-toggle"
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-0"
          />
          <label htmlFor="show-archived-toggle" className="text-xs text-slate-300 cursor-pointer font-medium select-none">
            Show Archived
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
            Loading workforce records...
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <Users className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No employees match the specified search and filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-850/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Employee</th>
                  <th className="p-4">Department & Designation</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Manager</th>
                  <th className="p-4">Assets</th>
                  <th className="p-4">Risk Score</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {employees.map((emp) => {
                  const isArch = emp.isArchived || emp.employmentStatus === EmploymentStatus.ARCHIVED;
                  return (
                    <tr key={emp.id} className="hover:bg-slate-850/50 transition-colors group">
                      <td className="p-4 font-mono text-cyan-400 font-bold">{emp.employeeCode}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-xs border border-cyan-400/20">
                            {emp.firstName?.[0]}
                            {emp.lastName?.[0]}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-100 block">{emp.firstName} {emp.lastName}</span>
                            <span className="text-[11px] font-mono text-slate-400 block">{emp.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700/60 text-[11px]">
                          {emp.department}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{emp.designation}</p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            isArch
                              ? 'bg-slate-800 text-slate-400 border border-slate-700'
                              : emp.employmentStatus === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : emp.riskScore > 50
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isArch ? 'ARCHIVED' : emp.employmentStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        {emp.managerName ? (
                          <span className="text-slate-300 font-medium">{emp.managerName}</span>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">None</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="flex items-center space-x-1.5 font-mono font-semibold text-cyan-400">
                          <HardDrive className="w-3.5 h-3.5" />
                          <span>{emp.assignedAssetCount || 0}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                            emp.riskScore > 50
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {emp.riskScore}/100
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setSelectedEmpId(emp.id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg text-xs transition-colors"
                            title="Edit Record"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(emp)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                            title="Duplicate Record"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleArchive(emp)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs transition-colors"
                            title={isArch ? 'Restore Employee' : 'Archive Employee'}
                          >
                            {isArch ? <RefreshCw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteEmp(emp)}
                            className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-lg text-xs transition-colors"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Employee Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-slate-100 text-sm">
                {editingEmp ? `Edit Employee: ${editingEmp.employeeCode}` : 'Add New Employee'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">First Name *</label>
                  <input
                    required
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Last Name *</label>
                  <input
                    required
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Corporate Email *</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1-555-0192"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Department *</label>
                  <select
                    value={deptForm}
                    onChange={(e) => setDeptForm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="IT Operations">IT Operations</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                    <option value="Legal & Compliance">Legal & Compliance</option>
                    <option value="Executive Leadership">Executive Leadership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Designation *</label>
                  <input
                    required
                    type="text"
                    value={desigForm}
                    onChange={(e) => setDesigForm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Reporting Manager</label>
                  <select
                    value={managerIdForm}
                    onChange={(e) => setManagerIdForm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                  >
                    <option value="">-- No Reporting Manager --</option>
                    {employees
                      .filter((e) => !editingEmp || e.id !== editingEmp.id)
                      .map((mgr) => (
                        <option key={mgr.id} value={mgr.id}>
                          {mgr.firstName} {mgr.lastName} ({mgr.employeeCode})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Office Location</label>
                  <input
                    type="text"
                    value={officeForm}
                    onChange={(e) => setOfficeForm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Employment Status</label>
                  <select
                    value={statusForm}
                    onChange={(e) => setStatusForm(e.target.value as EmploymentStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACTOR">Contractor</option>
                    <option value="INTERN">Intern</option>
                    <option value="PENDING">Pending</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="TERMINATED">Terminated</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={joiningDateForm}
                    onChange={(e) => setJoiningDateForm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Risk Score (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={riskScoreForm}
                    onChange={(e) => setRiskScoreForm(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Notes & Governance Remarks</label>
                <textarea
                  rows={2}
                  value={notesForm}
                  onChange={(e) => setNotesForm(e.target.value)}
                  placeholder="Special access notes, security clearances, or notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-600/20"
                >
                  Save Employee Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteEmp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-sm text-slate-100">Confirm Employee Deletion</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete employee{' '}
              <strong className="text-white">
                {confirmDeleteEmp.firstName} {confirmDeleteEmp.lastName} ({confirmDeleteEmp.employeeCode})
              </strong>
              ?
            </p>
            <p className="text-[11px] text-amber-400 bg-amber-950/50 p-2.5 rounded-xl border border-amber-900">
              Warning: All assigned hardware assets will be unassigned and marked as AVAILABLE in the asset register.
            </p>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setConfirmDeleteEmp(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Drawer */}
      <EmployeeProfileDrawer
        employeeId={selectedEmpId}
        onClose={() => setSelectedEmpId(null)}
        onEdit={(emp) => {
          setSelectedEmpId(null);
          handleOpenEdit(emp);
        }}
        onRefresh={loadEmployees}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={loadEmployees}
      />
    </div>
  );
};
