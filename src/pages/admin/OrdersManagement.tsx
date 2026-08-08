import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, ExternalLink, RefreshCw, Edit3 } from 'lucide-react';
import { Order } from '../../types';

export const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Edit Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<Order['status']>('Pending');
  const [startCount, setStartCount] = useState<number>(0);
  const [remains, setRemains] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders || []);
        }
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}`
        },
        body: JSON.stringify({
          status: newStatus,
          startCount: Number(startCount),
          remains: Number(remains)
        })
      });

      if (res.ok) {
        setSelectedOrder(null);
        await fetchOrders();
      }
    } catch (err) {
      console.error('Error updating order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const statuses = ['All', 'Pending', 'Processing', 'In Progress', 'Completed', 'Partial', 'Canceled', 'Failed'];

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'All' || o.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      o.id.includes(searchQuery) ||
      o.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.link.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Orders Management</h2>
            <p className="text-xs text-gray-500">Monitor all customer orders, update delivery progress and statuses</p>
          </div>
        </div>

        <button
          onClick={fetchOrders}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID, User Name, Service or Link..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">Loading orders list...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">No orders found matching filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 uppercase text-[11px] font-bold">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Link</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Charge</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">#{ord.id}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{ord.userName}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-800 max-w-xs truncate" title={ord.serviceName}>
                      {ord.serviceName}
                    </td>
                    <td className="py-3.5 px-4">
                      <a
                        href={ord.link.startsWith('http') ? ord.link : `https://${ord.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline font-mono text-xs truncate flex items-center space-x-1 max-w-xs"
                      >
                        <span className="truncate">{ord.link}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{ord.quantity.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-black text-emerald-700">₹{ord.charge.toFixed(2)}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setNewStatus(ord.status);
                          setStartCount(ord.startCount);
                          setRemains(ord.remains);
                        }}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-lg text-xs flex items-center space-x-1 ml-auto"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2">
              Edit Order #{selectedOrder.id}
            </h3>

            <div className="text-xs text-gray-500 space-y-1">
              <p><span className="font-bold">User:</span> {selectedOrder.userName}</p>
              <p><span className="font-bold">Service:</span> {selectedOrder.serviceName}</p>
              <p><span className="font-bold">Charge:</span> ₹{selectedOrder.charge.toFixed(2)}</p>
            </div>

            <form onSubmit={handleUpdateOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e: any) => setNewStatus(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Partial">Partial</option>
                  <option value="Canceled">Canceled</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Start Count
                  </label>
                  <input
                    type="number"
                    value={startCount}
                    onChange={(e) => setStartCount(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Remains
                  </label>
                  <input
                    type="number"
                    value={remains}
                    onChange={(e) => setRemains(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl text-xs hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Update Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
