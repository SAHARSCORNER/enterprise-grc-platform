import React, { useState, useEffect, useCallback } from 'react';
import {
  HardDrive,
  Plus,
  Search,
  QrCode,
  UserCheck,
  X,
  ShieldAlert,
  Edit3,
  Trash2,
  AlertCircle,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
} from 'lucide-react';
import { apiFetch } from '../shared/api/apiClient';
import { Asset, Employee, SocketEvents, AssetCategory, AssetStatus, ComplianceStatus } from '@grc/shared';
import { useSocketListener } from '../shared/hooks/useSocket';

export const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals State
  const [selectedQrAsset, setSelectedQrAsset] = useState<Asset | null>(null);
  const [assignAsset, setAssignAsset] = useState<Asset | null>(null);
  const [selectedEmpId, setSelectedEmpId] = useState('');

  // Add / Edit Asset Modal State
  const [showAssetFormModal, setShowAssetFormModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [confirmDeleteAsset, setConfirmDeleteAsset] = useState<Asset | null>(null);

  // Asset Form Fields
  const [name, setName] = useState('');
  const [assetCategory, setAssetCategory] = useState<AssetCategory>(AssetCategory.LAPTOP);
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [warrantyExpiry, setWarrantyExpiry] = useState('2028-12-31');
  const [cost, setCost] = useState(1200);
  const [location, setLocation] = useState('Headquarters (New York)');
  const [assetStatus, setAssetStatus] = useState<AssetStatus>(AssetStatus.AVAILABLE);
  const [riskScore, setRiskScore] = useState(10);
  const [compStatus, setCompStatus] = useState<ComplianceStatus>(ComplianceStatus.COMPLIANT);
  const [assignedEmpIdForm, setAssignedEmpIdForm] = useState('');

  const loadAssets = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (statusFilter) params.append('status', statusFilter);

    apiFetch<Asset[]>(`/assets?${params.toString()}`)
      .then((res) => setAssets(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [search, category, statusFilter]);

  useEffect(() => {
    loadAssets();
    apiFetch<Employee[]>('/employees?all=true')
      .then((res) => setEmployees(res))
      .catch((err) => console.error(err));
  }, [loadAssets]);

  // Real-time Socket.IO Sync
  useSocketListener(SocketEvents.ASSET_CREATED, () => loadAssets());
  useSocketListener(SocketEvents.ASSET_UPDATED, () => loadAssets());
  useSocketListener(SocketEvents.ASSET_DELETED, () => loadAssets());
  useSocketListener(SocketEvents.ASSET_ASSIGNED, () => loadAssets());
  useSocketListener(SocketEvents.ASSET_REMOVED, () => loadAssets());

  const resetAssetForm = () => {
    setEditingAsset(null);
    setName('');
    setAssetCategory(AssetCategory.LAPTOP);
    setSerialNumber('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setWarrantyExpiry('2028-12-31');
    setCost(1200);
    setLocation('Headquarters (New York)');
    setAssetStatus(AssetStatus.AVAILABLE);
    setRiskScore(10);
    setCompStatus(ComplianceStatus.COMPLIANT);
    setAssignedEmpIdForm('');
  };

  const handleOpenAddAsset = () => {
    resetAssetForm();
    setShowAssetFormModal(true);
  };

  const handleOpenEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setName(asset.name || '');
    setAssetCategory(asset.category || AssetCategory.LAPTOP);
    setSerialNumber(asset.serialNumber || '');
    setPurchaseDate(asset.purchaseDate || new Date().toISOString().split('T')[0]);
    setWarrantyExpiry(asset.warrantyExpiry || '2028-12-31');
    setCost(asset.cost !== undefined ? asset.cost : 1200);
    setLocation(asset.location || 'Headquarters (New York)');
    setAssetStatus(asset.status || AssetStatus.AVAILABLE);
    setRiskScore(asset.riskScore || 10);
    setCompStatus(asset.complianceStatus || ComplianceStatus.COMPLIANT);
    setAssignedEmpIdForm(asset.assignedEmployeeId || '');
    setShowAssetFormModal(true);
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        category: assetCategory,
        serialNumber: serialNumber || `SN-${assetCategory}-${Date.now()}`,
        purchaseDate,
        warrantyExpiry,
        cost,
        location,
        status: assetStatus,
        riskScore,
        complianceStatus: compStatus,
        assignedEmployeeId: assignedEmpIdForm || null,
      };

      if (editingAsset) {
        await apiFetch(`/assets/${editingAsset.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/assets', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setShowAssetFormModal(false);
      resetAssetForm();
      loadAssets();
    } catch (err: any) {
      alert(err.message || 'Failed to save asset record');
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDeleteAsset) return;
    try {
      await apiFetch(`/assets/${confirmDeleteAsset.id}`, { method: 'DELETE' });
      setConfirmDeleteAsset(null);
      loadAssets();
    } catch (err: any) {
      alert(err.message || 'Failed to delete asset');
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignAsset || !selectedEmpId) return;

    try {
      await apiFetch('/assets/assign', {
        method: 'POST',
        body: JSON.stringify({
          assetId: assignAsset.id,
          employeeId: selectedEmpId,
        }),
      });
      setAssignAsset(null);
      setSelectedEmpId('');
      loadAssets();
    } catch (err: any) {
      alert(err.message || 'Failed to assign asset');
    }
  };

  const handleUnassign = async (assetId: string) => {
    try {
      await apiFetch('/assets/unassign', {
        method: 'POST',
        body: JSON.stringify({ assetId }),
      });
      loadAssets();
    } catch (err: any) {
      alert(err.message || 'Failed to unassign asset');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center space-x-2">
            <HardDrive className="w-6 h-6 text-cyan-400" />
            <span>Enterprise Asset Inventory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hardware, software, cloud resource tracking, barcodes, real-time employee assignment, and GRC risk scoring
          </p>
        </div>

        <button
          onClick={handleOpenAddAsset}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Asset</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 glass-panel p-3.5">
        <div className="md:col-span-2 flex items-center space-x-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search asset tag, name, serial number, location..."
            className="bg-transparent text-xs text-slate-100 focus:outline-none w-full"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-slate-950 text-xs text-slate-300 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="LAPTOP">Laptop</option>
          <option value="DESKTOP">Desktop</option>
          <option value="SERVER">Server</option>
          <option value="FIREWALL">Firewall</option>
          <option value="VPN">VPN</option>
          <option value="DATABASE">Database</option>
          <option value="CLOUD_RESOURCE">Cloud Resource</option>
          <option value="MOBILE">Mobile Device</option>
          <option value="SOFTWARE_LICENSE">Software License</option>
          <option value="PRINTER">Printer</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 text-xs text-slate-300 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="RETIRED">Retired</option>
          <option value="DECOMMISSIONED">Decommissioned</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm animate-pulse">Loading enterprise assets...</div>
        ) : assets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <HardDrive className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No enterprise assets match the current filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-850/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Asset Tag</th>
                  <th className="p-4">Name / Serial Number</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assigned Employee</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Risk Score</th>
                  <th className="p-4">QR / Barcode</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-850/50 transition-colors group">
                    <td className="p-4 font-mono text-cyan-400 font-bold">{asset.assetTag}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-100">{asset.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">SN: {asset.serialNumber}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-800 rounded-lg text-slate-200 border border-slate-700/60 font-medium text-[11px]">
                        {asset.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          asset.status === 'ASSIGNED'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : asset.status === 'AVAILABLE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : asset.status === 'MAINTENANCE'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {asset.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {asset.assignedEmployeeName ? (
                        <div>
                          <span className="text-slate-200 font-medium block">{asset.assignedEmployeeName}</span>
                          <span className="text-[10px] text-cyan-400 font-mono">{(asset as any).assignedEmployeeCode}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-300">{asset.location || 'Headquarters'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                          asset.riskScore > 50
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {asset.riskScore}/100
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedQrAsset(asset)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg border border-slate-700 transition-colors"
                        title="View Barcode / QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {asset.status === 'ASSIGNED' ? (
                          <button
                            onClick={() => handleUnassign(asset.id)}
                            className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-lg text-[11px] font-medium border border-rose-800/60 transition-colors"
                          >
                            Unassign
                          </button>
                        ) : (
                          <button
                            onClick={() => setAssignAsset(asset)}
                            className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 rounded-lg text-[11px] font-medium border border-cyan-800/60 transition-colors"
                          >
                            Assign
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEditAsset(asset)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg text-xs transition-colors"
                          title="Edit Asset"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setConfirmDeleteAsset(asset)}
                          className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-lg text-xs transition-colors"
                          title="Delete Asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Asset Modal */}
      {showAssetFormModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-slate-100 text-sm">
                {editingAsset ? `Edit Asset: ${editingAsset.assetTag}` : 'Add New Enterprise Asset'}
              </h3>
              <button onClick={() => setShowAssetFormModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Asset Name *</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. MacBook Pro M3 Max 16-inch"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Category *</label>
                  <select
                    value={assetCategory}
                    onChange={(e) => setAssetCategory(e.target.value as AssetCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                  >
                    <option value="LAPTOP">Laptop</option>
                    <option value="DESKTOP">Desktop</option>
                    <option value="SERVER">Server</option>
                    <option value="FIREWALL">Firewall</option>
                    <option value="VPN">VPN</option>
                    <option value="DATABASE">Database</option>
                    <option value="CLOUD_RESOURCE">Cloud Resource</option>
                    <option value="MOBILE">Mobile Device</option>
                    <option value="SOFTWARE_LICENSE">Software License</option>
                    <option value="PRINTER">Printer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. SN-MBP-90182-US"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Cost (USD $)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Warranty Expiry</label>
                  <input
                    type="date"
                    value={warrantyExpiry}
                    onChange={(e) => setWarrantyExpiry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Office Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Asset Status</label>
                  <select
                    value={assetStatus}
                    onChange={(e) => setAssetStatus(e.target.value as AssetStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="RETIRED">Retired</option>
                    <option value="DECOMMISSIONED">Decommissioned</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Assigned Employee</label>
                  <select
                    value={assignedEmpIdForm}
                    onChange={(e) => setAssignedEmpIdForm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                  >
                    <option value="">-- Unassigned (Available in Pool) --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.employeeCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Security Risk Score (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={riskScore}
                    onChange={(e) => setRiskScore(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAssetFormModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-600/20"
                >
                  Save Asset Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedQrAsset && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-semibold text-slate-100 text-sm">{selectedQrAsset.name}</h3>
              <button onClick={() => setSelectedQrAsset(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-white p-4 rounded-xl inline-block shadow-inner">
              {selectedQrAsset.qrCodeDataUrl && <img src={selectedQrAsset.qrCodeDataUrl} alt="QR" className="w-48 h-48 mx-auto" />}
            </div>
            <div className="font-mono text-xs text-cyan-400 font-semibold">{selectedQrAsset.assetTag}</div>
            <div className="text-[11px] text-slate-400">SN: {selectedQrAsset.serialNumber}</div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteAsset && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-sm text-slate-100">Confirm Asset Deletion</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete asset{' '}
              <strong className="text-white">
                {confirmDeleteAsset.name} ({confirmDeleteAsset.assetTag})
              </strong>
              ?
            </p>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setConfirmDeleteAsset(null)}
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

      {/* Assign Modal */}
      {assignAsset && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-semibold text-slate-100 text-sm">Assign Asset: {assignAsset.assetTag}</h3>
              <button onClick={() => setAssignAsset(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Employee</label>
                <select
                  required
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode}) - {emp.department}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAssignAsset(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
