import React, { useState, useEffect } from 'react';
import { LifeBuoy, CheckCircle2, Clock, Send, X } from 'lucide-react';
import { SupportTicket } from '../../types';

export const AdminTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Active Selected Ticket
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [replying, setReplying] = useState<boolean>(false);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/admin/tickets', {
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

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyMessage.trim()) return;
    setReplying(true);

    try {
      const res = await fetch(`/api/admin/tickets/${activeTicket.id}/reply`, {
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
      console.error('Failed to send reply:', err);
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="space-y-5">

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Support Tickets Center</h2>
            <p className="text-xs text-gray-500">Reply to customer inquiries, resolve issues and update ticket statuses</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">No support tickets submitted.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveTicket(t)}
                className="p-4 sm:p-5 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      #{t.id}
                    </span>
                    <h3 className="font-bold text-sm text-gray-900">{t.subject}</h3>
                  </div>
                  <p className="text-xs text-gray-500">User: <span className="font-bold text-gray-800">{t.userName}</span> ({t.userEmail})</p>
                  <p className="text-[11px] text-gray-400">
                    Updated: {new Date(t.updatedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {t.status === 'Answered' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      Answered
                    </span>
                  )}
                  {t.status === 'Open' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      Open
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

      {activeTicket && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600">#{activeTicket.id}</span>
                <h3 className="text-lg font-black text-gray-900">{activeTicket.subject}</h3>
                <p className="text-xs text-gray-500">From: {activeTicket.userName} ({activeTicket.userEmail})</p>
              </div>
              <button onClick={() => setActiveTicket(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-200/60 max-h-96">
              {activeTicket.messages.map((m) => {
                const isAdmin = m.sender === 'admin';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isAdmin
                          ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-2xs'
                      }`}
                    >
                      <p className={`font-bold text-[10px] uppercase mb-1 ${isAdmin ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {m.senderName}
                      </p>
                      <p className="whitespace-pre-line">{m.message}</p>
                      <p className={`text-[9px] mt-1 text-right ${isAdmin ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendReply} className="flex items-center space-x-2 pt-2">
              <input
                type="text"
                placeholder="Type admin response..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <button
                type="submit"
                disabled={replying || !replyMessage.trim()}
                className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
