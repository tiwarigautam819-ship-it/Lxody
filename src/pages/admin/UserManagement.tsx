import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Minus, Ban, CheckCircle, Wallet, Shield } from 'lucide-react';
import { User } from '../../types';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Wallet adjustment modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [adjustType, setAdjustType] = useState<'add' | 'deduct'>('add');
  const [amount, setAmount] = useState<string>('100');
  const [adminNote, setAdminNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUsers(data.users || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;

    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/adjust-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}`
        },
        body: JSON.stringify({
          amount: numAmount,
          type: adjustType,
          adminNote: adminNote || `Admin ${adjustType} funds`
        })
      });

      if (res.ok) {
        setSelectedUser(null);
        setAmount('100');
        setAdminNote('');
        await fetchUsers();
      }
    } catch (err) {
      console.error('Error adjusting user balance:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleBlock = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-block`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}` }
      });

      if (res.ok) {
        await fetchUsers();
      }
    } catch (err) {
      console.error('Error toggling block user:', err);
    }
  };

  const filteredUsers = users.filter((u) => {
    return (
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">User Account Management</h2>
            <p className="text-xs text-gray-500">Manage user balances, roles, account status and transaction permissions</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by Name, Email or User ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">Loading users list...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">No users found matching your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 uppercase text-[11px] font-bold">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Wallet Balance</th>
                  <th className="py-3 px-4">Total Spent</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{u.name}</p>
                      <p className="text-[11px] text-gray-400 font-mono">{u.email}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">
                      ₹{u.walletBalance.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-800">
                      ₹{u.totalSpent.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.status === 'blocked' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 inline-flex items-center space-x-1">
                          <Ban className="w-3 h-3" />
                          <span>Blocked</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 inline-flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setAdjustType('add');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-xs"
                      >
                        + Add Funds
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setAdjustType('deduct');
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded-lg text-xs"
                      >
                        - Deduct
                      </button>
                      <button
                        onClick={() => handleToggleBlock(u.id)}
                        className={`font-bold px-2.5 py-1 rounded-lg text-xs ${
                          u.status === 'blocked'
                            ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                            : 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                        }`}
                      >
                        {u.status === 'blocked' ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Wallet Balance Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2">
              {adjustType === 'add' ? 'Add Funds to' : 'Deduct Funds from'} {selectedUser.name}
            </h3>

            <form onSubmit={handleAdjustBalance} className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-2">
                  Current Wallet Balance: <span className="font-bold text-gray-900">₹{selectedUser.walletBalance.toFixed(2)}</span>
                </p>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Admin Note / Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Manual UPI Verification / Refund"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl text-xs hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 text-white font-bold py-2.5 rounded-xl text-xs shadow-md disabled:opacity-50 ${
                    adjustType === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {submitting ? 'Processing...' : adjustType === 'add' ? 'Add Funds' : 'Deduct Funds'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
