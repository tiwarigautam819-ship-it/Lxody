import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, Wallet, CheckCircle2, Clock, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';
import { FundRequest, Order } from '../../types';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<FundRequest[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setPendingRequests(data.pendingFundRequests || []);
          setRecentOrders(data.recentOrders || []);
        }
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleQuickFundAction = async (requestId: string, status: 'Approved' | 'Rejected') => {
    try {
      const res = await fetch(`/api/admin/funds/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}`
        },
        body: JSON.stringify({ status, adminNote: `Quick ${status} from Dashboard` })
      });

      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to update fund request:', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Admin Control Center</h2>
          <p className="text-xs text-gray-500">Live monitoring of users, orders, deposit requests and system revenue</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigateTab('fund-requests')}
            className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
          >
            <Clock className="w-4 h-4" />
            <span>{pendingRequests.length} Pending Deposits</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">Total Users</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">{stats?.totalUsers || 0}</p>
          <p className="text-[11px] text-gray-500">Active customer accounts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">{stats?.totalOrders || 0}</p>
          <p className="text-[11px] text-gray-500">{stats?.pendingOrders || 0} currently processing</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700">₹{stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
          <p className="text-[11px] text-gray-500">Cumulative order charges</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">Approved Deposits</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-800">₹{stats?.totalDepositsApproved?.toFixed(2) || '0.00'}</p>
          <p className="text-[11px] text-gray-500">Verified UPI deposits</p>
        </div>

      </div>

      {/* Pending UTR Verification Requests */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>Pending UTR Deposit Requests ({pendingRequests.length})</span>
          </h3>
          <button
            onClick={() => onNavigateTab('fund-requests')}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            Manage All
          </button>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">No pending deposit verification requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 uppercase text-[11px] font-bold">
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">UTR Number</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingRequests.slice(0, 5).map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="py-3 px-3 font-bold text-gray-900">
                      {req.userName}
                      <p className="text-[11px] text-gray-400 font-normal">{req.userEmail}</p>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-emerald-700 text-sm">
                      ₹{req.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-800 font-bold">
                      {req.utrNumber}
                    </td>
                    <td className="py-3 px-3 text-gray-500 text-xs">
                      {new Date(req.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => handleQuickFundAction(req.id, 'Approved')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg text-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleQuickFundAction(req.id, 'Rejected')}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1 rounded-lg text-xs"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            <span>Recent Orders Stream</span>
          </h3>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            View All Orders
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-[11px] font-bold">
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Service</th>
                <th className="py-2.5 px-3">Qty</th>
                <th className="py-2.5 px-3">Charge</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.slice(0, 5).map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-50">
                  <td className="py-3 px-3 font-mono font-bold text-gray-900">#{ord.id}</td>
                  <td className="py-3 px-3 text-gray-800 font-medium">{ord.userName}</td>
                  <td className="py-3 px-3 font-bold text-gray-900 truncate max-w-xs">{ord.serviceName}</td>
                  <td className="py-3 px-3 font-bold text-gray-700">{ord.quantity.toLocaleString()}</td>
                  <td className="py-3 px-3 font-black text-gray-900">₹{ord.charge.toFixed(2)}</td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      {ord.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
