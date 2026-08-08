import React, { useState, useEffect } from 'react';
import { Wallet, CheckCircle2, XCircle, Clock, Filter, AlertCircle } from 'lucide-react';
import { FundRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const FundRequestsManagement: React.FC = () => {
  const { refreshUser } = useAuth();
  const [requests, setRequests] = useState<FundRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('Pending');

  // Action Modal State
  const [selectedReq, setSelectedReq] = useState<FundRequest | null>(null);
  const [actionType, setActionType] = useState<'Approved' | 'Rejected'>('Approved');
  const [adminNote, setAdminNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/fund-requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}` }
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setRequests(data.requests || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch fund requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/funds/${selectedReq.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}`
        },
        body: JSON.stringify({
          status: actionType,
          adminNote: adminNote || `Payment ${actionType.toLowerCase()} by Admin`
        })
      });

      if (res.ok) {
        setSelectedReq(null);
        setAdminNote('');
        await fetchRequests();
        await refreshUser();
      }
    } catch (err) {
      console.error('Failed to update fund request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filterStatus === 'All') return true;
    return r.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-md">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">UTR Payment Verification Requests</h2>
            <p className="text-xs text-gray-500">Verify user payment UTR / Transaction IDs and credit wallet balances</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {['Pending', 'Approved', 'Rejected', 'All'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">Loading fund requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">No fund requests found for this status.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 uppercase text-[11px] font-bold">
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Deposit Amount</th>
                  <th className="py-3 px-4">UTR Number</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Admin Note</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{req.userName}</p>
                      <p className="text-[11px] text-gray-400 font-mono">{req.userEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-700 text-base">
                      ₹{req.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-800">
                      {req.utrNumber}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {req.status === 'Approved' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 inline-flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved</span>
                        </span>
                      )}
                      {req.status === 'Pending' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 inline-flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </span>
                      )}
                      {req.status === 'Rejected' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 inline-flex items-center space-x-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-xs italic">
                      {req.adminNote || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      {req.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedReq(req);
                              setActionType('Approved');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReq(req);
                              setActionType('Rejected');
                            }}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1 rounded-lg text-xs"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2">
              {actionType} Deposit Request for {selectedReq.userName}
            </h3>

            <div className="bg-gray-50 p-3 rounded-xl space-y-1 text-xs text-gray-700">
              <p>Amount: <span className="font-extrabold text-emerald-700 text-sm">₹{selectedReq.amount.toFixed(2)}</span></p>
              <p>UTR No: <span className="font-mono font-bold">{selectedReq.utrNumber}</span></p>
              {actionType === 'Approved' && (
                <p className="text-emerald-800 font-bold pt-1">
                  ✓ ₹{selectedReq.amount.toFixed(2)} will be credited to {selectedReq.userName}'s wallet immediately.
                </p>
              )}
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Admin Note / Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verified via Bank Statement"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl text-xs hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 text-white font-bold py-2.5 rounded-xl text-xs shadow-md disabled:opacity-50 ${
                    actionType === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submitting ? 'Processing...' : `Confirm ${actionType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
