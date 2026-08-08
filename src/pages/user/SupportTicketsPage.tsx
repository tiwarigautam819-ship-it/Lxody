import React, { useState, useEffect } from 'react';
import { LifeBuoy, PlusCircle, MessageSquare, Clock, CheckCircle2, Send, X } from 'lucide-react';
import { SupportTicket } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const SupportTicketsPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Selected Ticket State
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [replying, setReplying] = useState<boolean>(false);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets/my-tickets', {
        headers: { Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTickets(data.tickets || []);
          if (activeTicket) {
            const updated = data.tickets.find((t: SupportTicket) => t.id === activeTicket.id);
            if (updated) setActiveTicket(updated);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}`
        },
        body: JSON.stringify({ subject, message, priority })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubject('');
        setMessage('');
        setShowCreateModal(false);
        await fetchTickets();
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyMessage.trim()) return;
    setReplying(true);

    try {
      const res = await fetch(`/api/tickets/${activeTicket.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}`
        },
        body: JSON.stringify({ message: replyMessage.trim() })
      });

      if (res.ok) {
        setReplyMessage('');
        await fetchTickets();
      }
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] py-6 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#1e60d5] text-white rounded-xl flex items-center justify-center shadow-md">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Support Tickets</h2>
              <p className="text-xs text-gray-500">Need help with orders or deposits? Contact our 24/7 support team.</p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#1e60d5] hover:bg-blue-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm uppercase shadow-sm transition-all flex items-center space-x-2 active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Ticket</span>
          </button>
        </div>

        {/* Tickets Grid / List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500 text-sm">Loading support tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm space-y-2">
              <LifeBuoy className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="font-semibold text-gray-700">No support tickets created yet.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-[#1e60d5] text-xs font-bold underline"
              >
                Click here to submit a ticket
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveTicket(t)}
                  className="p-4 sm:p-5 hover:bg-blue-50/40 cursor-pointer transition-colors flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-[#1e60d5] bg-blue-50 px-2 py-0.5 rounded-md">
                        #{t.id}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-gray-900">{t.subject}</h3>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {t.messages[t.messages.length - 1]?.message || 'No messages'}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Updated: {new Date(t.updatedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    {t.status === 'Answered' && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Answered</span>
                      </span>
                    )}
                    {t.status === 'Open' && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Open</span>
                      </span>
                    )}
                    {t.status === 'Closed' && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                        Closed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-black text-gray-900">Create Support Ticket</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Order #10001 status question or Deposit help"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e60d5]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e60d5]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your issue or question in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e60d5]"
                    required
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-[#1e60d5] text-white font-bold py-3 rounded-xl hover:bg-blue-700 text-sm shadow-md disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Ticket Thread Drawer/Modal */}
        {activeTicket && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col relative">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-[#1e60d5]">#{activeTicket.id}</span>
                  <h3 className="text-lg font-black text-gray-900">{activeTicket.subject}</h3>
                </div>
                <button onClick={() => setActiveTicket(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-200/60 max-h-96">
                {activeTicket.messages.map((m) => {
                  const isAdmin = m.sender === 'admin';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isAdmin
                            ? 'bg-blue-600 text-white rounded-tl-none shadow-sm'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-tr-none shadow-2xs'
                        }`}
                      >
                        <p className={`font-bold text-[10px] uppercase mb-1 ${isAdmin ? 'text-blue-200' : 'text-gray-400'}`}>
                          {m.senderName}
                        </p>
                        <p className="whitespace-pre-line">{m.message}</p>
                        <p className={`text-[9px] mt-1 text-right ${isAdmin ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  placeholder="Type your reply message..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e60d5]"
                />
                <button
                  type="submit"
                  disabled={replying || !replyMessage.trim()}
                  className="bg-[#1e60d5] text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
