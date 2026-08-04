import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Search, Users, RefreshCw, Layers, ShieldCheck, Filter } from 'lucide-react';
import { apiFetch } from '../shared/api/apiClient';
import { SocketEvents, Employee } from '@grc/shared';
import { useSocketListener } from '../shared/hooks/useSocket';
import { CustomEmployeeNode } from '../widgets/nodes/CustomEmployeeNode';
import { CustomAssetNode } from '../widgets/nodes/CustomAssetNode';
import { DiagramContextMenu } from '../widgets/DiagramContextMenu';
import { EmployeeProfileDrawer } from '../widgets/EmployeeProfileDrawer';

const NetworkDiagramContent: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Context Menu & Selection State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeData: any } | null>(null);
  const [profileEmpId, setProfileEmpId] = useState<string | null>(null);

  // Drag and Drop Manager Assignment Modal State
  const [dragReassignPrompt, setDragReassignPrompt] = useState<{
    sourceEmpId: string;
    sourceName: string;
    targetMgrId: string;
    targetName: string;
  } | null>(null);

  const { fitView, zoomTo } = useReactFlow();

  const nodeTypes = useMemo(
    () =>
      ({
        employeeNode: CustomEmployeeNode,
        assetNode: CustomAssetNode,
      } as any),
    []
  );

  const loadGraph = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (showArchived) params.append('showArchived', 'true');

    apiFetch<any>(`/graph?${params.toString()}`)
      .then((res) => {
        setNodes(res.nodes);
        setEdges(res.edges);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [showArchived, setNodes, setEdges]);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  // Real-time Socket.IO Listeners
  useSocketListener(SocketEvents.EMPLOYEE_CREATED, () => loadGraph());
  useSocketListener(SocketEvents.EMPLOYEE_UPDATED, () => loadGraph());
  useSocketListener(SocketEvents.EMPLOYEE_DELETED, () => loadGraph());
  useSocketListener(SocketEvents.EMPLOYEE_ARCHIVED, () => loadGraph());
  useSocketListener(SocketEvents.EMPLOYEE_RESTORED, () => loadGraph());
  useSocketListener(SocketEvents.EMPLOYEE_MANAGER_CHANGED, () => loadGraph());
  useSocketListener(SocketEvents.EMPLOYEE_BULK_IMPORTED, () => loadGraph());
  useSocketListener(SocketEvents.ASSET_ASSIGNED, () => loadGraph());
  useSocketListener(SocketEvents.ASSET_REMOVED, () => loadGraph());

  // Handle Node Click / Right-Click for Context Menu
  const handleNodeContextMenu = useCallback((event: React.MouseEvent, node: any) => {
    event.preventDefault();
    if (node.type === 'group') return;
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      nodeData: node.data,
    });
  }, []);

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: any) => {
    if (node.type === 'employeeNode') {
      setProfileEmpId(node.data.id);
    }
  }, []);

  // Drag & Drop Manager Reassignment Collision Handler
  const handleNodeDragStop = useCallback(
    (_event: any, draggedNode: any) => {
      if (draggedNode.type !== 'employeeNode') return;

      // Find overlapping employee node
      const draggedPos = draggedNode.position;
      const targetNode = nodes.find(
        (n) =>
          n.id !== draggedNode.id &&
          n.type === 'employeeNode' &&
          Math.abs(n.position.x - draggedPos.x) < 80 &&
          Math.abs(n.position.y - draggedPos.y) < 80
      );

      if (targetNode) {
        setDragReassignPrompt({
          sourceEmpId: draggedNode.data.id,
          sourceName: draggedNode.data.label,
          targetMgrId: targetNode.data.id,
          targetName: targetNode.data.label,
        });
      }
    },
    [nodes]
  );

  const confirmManagerReassignment = async () => {
    if (!dragReassignPrompt) return;
    try {
      await apiFetch(`/employees/${dragReassignPrompt.sourceEmpId}/manager`, {
        method: 'PATCH',
        body: JSON.stringify({ managerId: dragReassignPrompt.targetMgrId }),
      });
      setDragReassignPrompt(null);
      loadGraph();
    } catch (err: any) {
      alert(err.message || 'Failed to reassign reporting manager');
    }
  };

  const handleHighlightConnections = useCallback(
    (nodeId: string) => {
      setEdges((prevEdges) =>
        prevEdges.map((e) => {
          if (e.source === nodeId || e.target === nodeId) {
            return { ...e, style: { ...e.style, stroke: '#38bdf8', strokeWidth: 3.5 } };
          }
          return { ...e, style: { ...e.style, opacity: 0.3 } };
        })
      );
    },
    [setEdges]
  );

  const filteredNodes = useMemo(() => {
    if (!searchFilter) return nodes;
    const lower = searchFilter.toLowerCase();
    return nodes.map((n) => {
      const label = n.data?.label || '';
      const code = n.data?.code || '';
      const match = label.toLowerCase().includes(lower) || code.toLowerCase().includes(lower);
      return {
        ...n,
        selected: match,
      };
    });
  }, [nodes, searchFilter]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col relative bg-slate-950">
      {/* Topology Control Panel */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between z-10 gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Bi-Directional Network & Asset Topology</span>
          </h1>
          <p className="text-xs text-slate-400">
            Interactive, real-time synchronized hierarchy & asset assignment graph. Drag employee onto manager to reassign.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Highlight Filter */}
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 w-64">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Highlight node label..."
              className="bg-transparent text-xs text-slate-100 focus:outline-none w-full"
            />
          </div>

          {/* Show Archived Toggle */}
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <input
              id="diagram-show-archived"
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-0"
            />
            <label htmlFor="diagram-show-archived" className="text-xs text-slate-300 font-medium cursor-pointer select-none">
              Show Archived
            </label>
          </div>

          <button
            onClick={loadGraph}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl border border-slate-700 transition-colors"
            title="Reload Topology"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* React Flow Viewport */}
      <div className="flex-1 w-full h-full relative" onClick={() => setContextMenu(null)}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm animate-pulse z-20">
            Rendering Synchronized Topology Graph...
          </div>
        ) : (
          <ReactFlow
            nodes={filteredNodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeContextMenu={handleNodeContextMenu}
            onNodeClick={handleNodeClick}
            onNodeDragStop={handleNodeDragStop}
            fitView
            className="bg-slate-950"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
            <Controls className="bg-slate-900 border border-slate-800 text-slate-100" />
            <MiniMap
              nodeColor={(n: any) => {
                if (n.type === 'assetNode') return '#3b82f6';
                if (n.data?.statusCategory === 'high_risk') return '#ef4444';
                if (n.data?.statusCategory === 'pending') return '#f59e0b';
                if (n.data?.statusCategory === 'inactive') return '#64748b';
                return '#10b981';
              }}
              maskColor="rgba(15, 23, 42, 0.75)"
              className="bg-slate-900 border border-slate-800 rounded-xl"
            />
            <Panel position="bottom-right" className="bg-slate-900/95 border border-slate-800 p-3 rounded-xl text-xs space-y-1.5 shadow-xl">
              <div className="font-semibold text-slate-200">Topology Status Legend</div>
              <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /><span className="text-slate-400">Active Employee</span></div>
              <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-500" /><span className="text-slate-400">Inactive / Archived</span></div>
              <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="text-slate-400">Pending Employee</span></div>
              <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" /><span className="text-slate-400">High Risk Employee</span></div>
              <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded bg-blue-500" /><span className="text-slate-400">Child Asset Node</span></div>
            </Panel>
          </ReactFlow>
        )}
      </div>

      {/* Floating Context Menu */}
      {contextMenu && (
        <DiagramContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeData={contextMenu.nodeData}
          onClose={() => setContextMenu(null)}
          onViewDetails={(empId) => setProfileEmpId(empId)}
          onEditEmployee={(emp) => setProfileEmpId(emp.id)}
          onDeleteEmployee={async (empId) => {
            if (confirm('Delete this employee?')) {
              await apiFetch(`/employees/${empId}`, { method: 'DELETE' });
              loadGraph();
            }
          }}
          onAssignAsset={(empId) => setProfileEmpId(empId)}
          onChangeManager={(emp) => setProfileEmpId(emp.id)}
          onHighlightConnections={handleHighlightConnections}
          onCenterView={() => fitView({ duration: 800 })}
        />
      )}

      {/* Drag and Drop Manager Assignment Prompt */}
      {dragReassignPrompt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-100 text-sm">Reassign Reporting Hierarchy</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Set <strong className="text-cyan-400">{dragReassignPrompt.sourceName}</strong> to report directly to manager{' '}
              <strong className="text-blue-400">{dragReassignPrompt.targetName}</strong>?
            </p>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setDragReassignPrompt(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={confirmManagerReassignment}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/20"
              >
                Confirm Reassignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Profile Slide Drawer */}
      <EmployeeProfileDrawer
        employeeId={profileEmpId}
        onClose={() => setProfileEmpId(null)}
        onEdit={() => {}}
        onRefresh={loadGraph}
      />
    </div>
  );
};

export const NetworkDiagramPage: React.FC = () => (
  <ReactFlowProvider>
    <NetworkDiagramContent />
  </ReactFlowProvider>
);
