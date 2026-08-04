import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { HardDrive, Globe, Printer, Shield } from 'lucide-react';

export const CustomAssetNode = memo(({ data, selected }: any) => {
  const { label, code, category, riskScore, status, isGlobal } = data;

  const IconComponent = category === 'PRINTER' ? Printer : category === 'FIREWALL' ? Shield : HardDrive;

  return (
    <div
      className={`relative w-44 rounded-xl p-2.5 bg-slate-950/95 backdrop-blur-md border ${
        isGlobal ? 'border-sky-500/80 shadow-sky-500/20' : 'border-slate-800'
      } ${selected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950' : 'shadow-lg'} transition-all`}
    >
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-blue-400 !border-2 !border-slate-900" />

      {isGlobal && (
        <span className="absolute -top-2.5 right-2 px-1.5 py-0.2 rounded-full text-[8px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-600 flex items-center space-x-1 shadow">
          <Globe className="w-2.5 h-2.5 text-sky-400" />
          <span>GLOBAL SHARED</span>
        </span>
      )}

      <div className="flex items-center space-x-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
          isGlobal ? 'bg-sky-950/80 border-sky-800 text-sky-400' : 'bg-blue-950/80 border-blue-800 text-blue-400'
        }`}>
          <IconComponent className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <h5 className="text-[11px] font-semibold text-slate-100 truncate" title={label}>{label}</h5>
          <p className="font-mono text-[9px] text-cyan-400">{code}</p>
        </div>
      </div>

      <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400">
        <span className="font-medium text-slate-300">{category}</span>
        <span className="px-1.5 py-0.2 rounded bg-slate-850 border border-slate-750 text-slate-300 font-mono">
          {status}
        </span>
      </div>
    </div>
  );
});

CustomAssetNode.displayName = 'CustomAssetNode';
