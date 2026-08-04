import React, { useState, useEffect, useCallback } from 'react';
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  Tag,
  Trash2,
  Edit3,
} from 'lucide-react';
import { apiFetch } from '../shared/api/apiClient';
import { Ticket, SocketEvents, TicketPriority, TicketStatus, TicketCategory } from '@grc/shared';
import { useSocketListener } from '../shared/hooks/useSocket';

export const TicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Raise Ticket Modal State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>(TicketCategory.IT_ACCESS);
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [reporter, setReporter] = useState('System Administrator');

  const loadTickets = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (statusFilter) params.append('status', statusFilter);
    if (priorityFilter) params.append('priority', priorityFilter);

    apiFetch<Ticket[]>(`/tickets?${params.toString()}`)
      .then((res) => setTickets(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Real-time Socket.IO Listeners
  useSocketListener(SocketEvents.TICKET_CREATED, () => loadTickets());
  useSocketListener(SocketEvents.TICKET_UPDATED, () => loadTickets());
  useSocketListener(SocketEvents.TICKET_DELETED, () => loadTickets());

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          category,
          priority,
          reporter,
        }),
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      loadTickets();
    } catch (err: any) {
      alert(err.message || 'Failed to raise ticket');
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      await apiFetch(`/tickets/${ticketId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      loadTickets();
    } catch (err: any) {
      alert(err.message || 'Failed to update ticket status');
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await apiFetch(`/tickets/${ticketId}`, { method: 'DELETE' });
      loadTickets();
    } catch (err: any) {
      alert(err.message || 'Failed to delete ticket');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center space-x-2">
            <LifeBuoy className="w-6 h-6 text-cyan-400" />
            <span>Ticket Raise & GRC Service Desk</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Submit, track, and resolve IT access, security incident, and compliance queries</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Raise New Ticket</span>
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
            placeholder="Search ticket code, title, reporter..."
            className="bg-transparent text-xs text-slate-100 focus:outline-none w-full"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 text-xs text-slate-300 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-slate-950 text-xs text-slate-300 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="HIGH">High Priority</option>
          <option value="CRITICAL">Critical Priority</option>
        </select>
      </div>

      {/* Tickets List */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm animate-pulse">Loading service tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <LifeBuoy className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No service tickets currently match the specified filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 hover:bg-slate-850/40 transition-colors flex items-start justify-between">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-cyan-400 font-bold text-xs">{t.ticketCode}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        t.priority === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : t.priority === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {t.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {t.category}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-100">{t.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-500 pt-1">
                    <span>Reporter: <strong className="text-slate-300">{t.reporter}</strong></span>
                    {t.assignedTo && <span>&bull; Assigned to: <strong className="text-cyan-400">{t.assignedTo}</strong></span>}
                    <span>&bull; Date: {new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t.id, e.target.value as TicketStatus)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border focus:outline-none ${
                      t.status === 'RESOLVED' || t.status === 'CLOSED'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : t.status === 'IN_PROGRESS'
                        ? 'bg-blue-950 text-blue-300 border-blue-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>

                  <button
                    onClick={() => handleDeleteTicket(t.id)}
                    className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-lg text-xs transition-colors"
                    title="Delete Ticket"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raise Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-slate-100 text-sm">Raise New Ticket</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Ticket Subject / Title *</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Production Database IAM Access Request"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TicketCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                  >
                    <option value="IT_ACCESS">IT Access & Permissions</option>
                    <option value="SECURITY_INCIDENT">Security Incident Report</option>
                    <option value="ASSET_REQUEST">Hardware / Asset Request</option>
                    <option value="COMPLIANCE_QUERY">Compliance & Audit Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Reporter Name</label>
                <input
                  type="text"
                  value={reporter}
                  onChange={(e) => setReporter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide complete details, environment, and business justification..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-600/20"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
