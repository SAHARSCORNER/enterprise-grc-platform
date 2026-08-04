import React from 'react';
import {
  Eye,
  Edit3,
  Trash2,
  HardDrive,
  UserCheck,
  Building2,
  Sparkles,
  Maximize2,
  X,
} from 'lucide-react';

interface DiagramContextMenuProps {
  x: number;
  y: number;
  nodeData: any;
  onClose: () => void;
  onViewDetails: (empId: string) => void;
  onEditEmployee: (emp: any) => void;
  onDeleteEmployee: (empId: string) => void;
  onAssignAsset: (empId: string) => void;
  onChangeManager: (emp: any) => void;
  onHighlightConnections: (nodeId: string) => void;
  onCenterView: (nodeId: string) => void;
}

export const DiagramContextMenu: React.FC<DiagramContextMenuProps> = ({
  x,
  y,
  nodeData,
  onClose,
  onViewDetails,
  onEditEmployee,
  onDeleteEmployee,
  onAssignAsset,
  onChangeManager,
  onHighlightConnections,
  onCenterView,
}) => {
  if (!nodeData) return null;

  const isEmployee = nodeData.type === 'employee';

  return (
    <div
      style={{ top: y, left: x }}
      className="fixed z-50 bg-slate-900/95 backdrop-blur-md border border-slate-750 rounded-xl shadow-2xl p-1.5 w-56 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="px-2.5 py-1.5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="font-semibold text-slate-100 block truncate">{nodeData.label}</span>
          <span className="font-mono text-[10px] text-cyan-400">{nodeData.code}</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="py-1 space-y-0.5">
        <button
          onClick={() => {
            onViewDetails(nodeData.id);
            onClose();
          }}
          className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg flex items-center space-x-2 text-cyan-300 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Profile Details</span>
        </button>

        {isEmployee && (
          <>
            <button
              onClick={() => {
                onEditEmployee(nodeData);
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-400" />
              <span>Edit Employee</span>
            </button>

            <button
              onClick={() => {
                onAssignAsset(nodeData.id);
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span>Assign Asset</span>
            </button>

            <button
              onClick={() => {
                onChangeManager(nodeData);
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Change Manager</span>
            </button>
          </>
        )}

        <button
          onClick={() => {
            onHighlightConnections(nodeData.id);
            onClose();
          }}
          className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Highlight Connections</span>
        </button>

        <button
          onClick={() => {
            onCenterView(nodeData.id);
            onClose();
          }}
          className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Center View</span>
        </button>

        {isEmployee && (
          <div className="pt-1 border-t border-slate-800">
            <button
              onClick={() => {
                onDeleteEmployee(nodeData.id);
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 hover:bg-rose-950/80 text-rose-300 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Employee</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
