import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { Order } from '../../types';

interface MyOrdersPageProps {
  onNavigate: (page: string) => void;
}

export const MyOrdersPage: React.FC<MyOrdersPageProps> = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const statuses = ['All', 'Pending', 'Processing', 'In Progress', 'Completed', 'Partial', 'Canceled', 'Failed'];

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'All' || o.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      o.id.includes(searchQuery) ||
      o.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.link.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        );
      case 'In Progress':
      case 'Processing':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>{status}</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </span>
        );
      case 'Canceled':
      case 'Failed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            <span>{status}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] py-6 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#1e60d5] text-white rounded-xl flex items-center justify-center shadow-md">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">My Orders</h2>
              <p className="text-xs text-gray-500">Track order progress, status and charge details</p>
            </div>
          </div>

          <div className="text-right text-xs text-gray-500">
            Total Orders: <span className="font-bold text-gray-900 text-sm">{orders.length}</span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order ID, Service or Link..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e60d5] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? 'bg-[#1e60d5] text-white shadow-xs'
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
            <div className="p-12 text-center text-gray-500 text-sm">Loading your orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">No orders found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your filter or search query</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-extrabold uppercase text-[11px]">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Link</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        #{ord.id}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-bold text-gray-900 truncate" title={ord.serviceName}>
                          {ord.serviceName}
                        </p>
                        <p className="text-[11px] text-gray-400">{ord.categoryName}</p>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <a
                          href={ord.link.startsWith('http') ? ord.link : `https://${ord.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1e60d5] hover:underline font-mono text-xs truncate flex items-center space-x-1"
                        >
                          <span className="truncate">{ord.link}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-gray-800">
                        {ord.quantity.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-black text-gray-900">
                        ₹{ord.charge.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(ord.status)}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap text-xs">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-2.5 py-1 rounded-lg text-xs"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-black text-gray-900">Order Details #{selectedOrder.id}</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 font-bold text-lg p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <p className="text-gray-400 uppercase font-bold text-[10px]">Service</p>
                  <p className="font-bold text-gray-900 mt-0.5">{selectedOrder.serviceName}</p>
                </div>

                <div>
                  <p className="text-gray-400 uppercase font-bold text-[10px]">Target Link</p>
                  <a
                    href={selectedOrder.link.startsWith('http') ? selectedOrder.link : `https://${selectedOrder.link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[#1e60d5] break-all underline"
                  >
                    {selectedOrder.link}
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-gray-400 uppercase font-bold text-[10px]">Quantity</p>
                    <p className="font-extrabold text-base text-gray-900">{selectedOrder.quantity.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-gray-400 uppercase font-bold text-[10px]">Charge</p>
                    <p className="font-black text-base text-emerald-700">₹{selectedOrder.charge.toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-gray-400 uppercase font-bold text-[10px]">Start Count</p>
                    <p className="font-bold text-gray-800">{selectedOrder.startCount}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-gray-400 uppercase font-bold text-[10px]">Remains</p>
                    <p className="font-bold text-gray-800">{selectedOrder.remains}</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 uppercase font-bold text-[10px]">Current Status</p>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>

                <div>
                  <p className="text-gray-400 uppercase font-bold text-[10px]">Placed At</p>
                  <p className="text-gray-700 font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full bg-[#1e60d5] text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
