import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { HardDrive, ShieldAlert, UserCheck, UserX, Clock, Shield } from 'lucide-react';

export const CustomEmployeeNode = memo(({ data, selected }: any) => {
  const {
    label,
    code,
    role,
    department,
    status,
    statusCategory,
    riskScore,
    assignedAssetCount,
    managerName,
  } = data;

  // Status Colors Mapping
  // Green = Active, Gray = Inactive, Orange = Pending, Red = High Risk
  const statusStyles: Record<string, { border: string; bg: string; dot: string; text: string }> = {
    active: {
      border: 'border-emerald-500/60',
      bg: 'bg-emerald-950/40',
      dot: 'bg-emerald-400',
      text: 'text-emerald-400',
    },
    inactive: {
      border: 'border-slate-600',
      bg: 'bg-slate-900/80',
      dot: 'bg-slate-500',
      text: 'text-slate-400',
    },
    pending: {
      border: 'border-amber-500/60',
      bg: 'bg-amber-950/40',
      dot: 'bg-amber-400',
      text: 'text-amber-400',
    },
    high_risk: {
      border: 'border-rose-500/80',
      bg: 'bg-rose-950/50',
      dot: 'bg-rose-500 animate-pulse',
      text: 'text-rose-400',
    },
  };

  const style = statusStyles[statusCategory] || statusStyles.active;

  return (
    <div
      className={`relative w-48 rounded-xl p-3 bg-slate-900/95 backdrop-blur-md border ${style.border} ${
        selected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 shadow-cyan-500/30' : 'shadow-xl'
      } transition-all group`}
    >
      {/* React Flow Handles */}
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-slate-900" />

      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${style.dot} shadow-sm`} />
          <span className="font-mono text-[10px] text-cyan-400 font-bold">{code}</span>
        </div>
        <span
          className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
            riskScore > 50 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
          }`}
        >
          {riskScore}/100
        </span>
      </div>

      {/* Employee Body */}
      <div className="mt-2 space-y-0.5">
        <h4 className="text-xs font-bold text-slate-100 truncate">{label}</h4>
        <p className="text-[10px] text-slate-400 truncate">{role}</p>
      </div>

      {/* Bottom Footer Info */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
        <span className="flex items-center space-x-1 text-slate-400">
          <HardDrive className="w-3 h-3 text-cyan-400" />
          <span>{assignedAssetCount || 0} Assets</span>
        </span>

        {managerName ? (
          <span className="text-slate-400 truncate max-w-[80px]" title={`Manager: ${managerName}`}>
            &bull; {managerName.split(' ')[0]}
          </span>
        ) : (
          <span className="text-indigo-400 font-medium">Head</span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-slate-900" />
    </div>
  );
});

CustomEmployeeNode.displayName = 'CustomEmployeeNode';
