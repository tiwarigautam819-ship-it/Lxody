import React, { useState, useEffect } from 'react';
import { List, Plus, Edit3, Trash2, Check, X, RefreshCw, Percent } from 'lucide-react';
import { Service, ServiceCategory } from '../../types';

export const ServicesManagement: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showBulkMarginModal, setShowBulkMarginModal] = useState<boolean>(false);
  const [bulkMarginInput, setBulkMarginInput] = useState<string>('20');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Form Fields
  const [categoryId, setCategoryId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [originalPrice, setOriginalPrice] = useState<string>('50');
  const [marginPercent, setMarginPercent] = useState<string>('20');
  const [minQuantity, setMinQuantity] = useState<string>('100');
  const [maxQuantity, setMaxQuantity] = useState<string>('10000');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const handleSyncFromProvider = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      // Get providers list
      const provRes = await fetch('/api/admin/api-providers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}` }
      });
      const provData = await provRes.json();
      if (provData.success && provData.providers?.length > 0) {
        const providerId = provData.providers[0].id;
        const res = await fetch(`/api/admin/api-providers/${providerId}/sync-services`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}` }
        });
        const data = await res.json();
        if (data.message) {
          setSyncMsg(data.message);
          await fetchServices();
        }
      }
    } catch (err) {
      console.error('Error syncing services:', err);
    } finally {
      setSyncing(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
        setServices(data.services || []);
        if (data.categories?.length > 0 && !categoryId) {
          setCategoryId(data.categories[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        categoryId,
        name,
        originalPrice: Number(originalPrice),
        marginPercent: Number(marginPercent),
        minQuantity: Number(minQuantity),
        maxQuantity: Number(maxQuantity),
        description
      };

      const url = selectedService ? `/api/admin/services/${selectedService.id}` : '/api/admin/services';
      const method = selectedService ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowAddModal(false);
        setSelectedService(null);
        setName('');
        setDescription('');
        await fetchServices();
      }
    } catch (err) {
      console.error('Error saving service:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (srv: Service) => {
    setSelectedService(srv);
    setCategoryId(srv.categoryId);
    setName(srv.name);
    setOriginalPrice(srv.originalPrice.toString());
    setMarginPercent(srv.marginPercent.toString());
    setMinQuantity(srv.minQuantity.toString());
    setMaxQuantity(srv.maxQuantity.toString());
    setDescription(srv.description || '');
    setShowAddModal(true);
  };

  const handleSaveBulkMargin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSyncMsg(null);
    try {
      const res = await fetch('/api/admin/services/bulk-margin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}`
        },
        body: JSON.stringify({ marginPercent: Number(bulkMarginInput) })
      });
      const data = await res.json();
      if (data.success) {
        setSyncMsg(data.message);
        setShowBulkMarginModal(false);
        await fetchServices();
      }
    } catch (err) {
      console.error('Failed to update bulk margin:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md">
            <List className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Services & Rate Settings</h2>
            <p className="text-xs text-gray-500">Configure service titles, minimum/maximum limits, original costs and margins</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            onClick={() => setShowBulkMarginModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-1 shadow-sm cursor-pointer"
          >
            <Percent className="w-4 h-4" />
            <span>Set Bulk Margin</span>
          </button>

          <button
            onClick={handleSyncFromProvider}
            disabled={syncing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing API...' : 'Import / Sync Services'}</span>
          </button>

          <button
            onClick={() => {
              setSelectedService(null);
              setName('');
              setDescription('');
              setShowAddModal(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Service</span>
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between">
          <span>{syncMsg}</span>
          <button onClick={() => setSyncMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            Dismiss
          </button>
        </div>
      )}

      {/* Services Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">Loading services...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 uppercase text-[11px] font-bold">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Service Name</th>
                  <th className="py-3 px-4">Original Rate</th>
                  <th className="py-3 px-4">Margin %</th>
                  <th className="py-3 px-4">Final Rate / 1k</th>
                  <th className="py-3 px-4">Min / Max</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {services.map((srv) => (
                  <tr key={srv.id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-500">{srv.id}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{srv.name}</p>
                      <p className="text-[11px] text-gray-400">{srv.categoryName}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-600">₹{srv.originalPrice.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-bold text-indigo-600">+{srv.marginPercent}%</td>
                    <td className="py-3.5 px-4 font-black text-emerald-700 text-base">
                      ₹{srv.finalPrice.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 font-medium">
                      {srv.minQuantity.toLocaleString()} / {srv.maxQuantity.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(srv)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-1 rounded-lg text-xs"
                      >
                        Edit Rate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2">
              {selectedService ? 'Edit Service Rates' : 'Add New Service'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Instagram Real Followers [Non Drop]"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Original Cost / 1k (₹)
                  </label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Profit Margin (%)
                  </label>
                  <input
                    type="number"
                    value={marginPercent}
                    onChange={(e) => setMarginPercent(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>
              </div>

              {/* Real-time calculated price preview */}
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-900">
                <div>
                  <span className="text-emerald-700">Calculated Final Price / 1k:</span>
                  <p className="text-[10px] text-emerald-600 font-normal">
                    ₹{Number(originalPrice) || 0} + {Number(marginPercent) || 0}% margin
                  </p>
                </div>
                <span className="text-lg font-black text-emerald-700">
                  ₹{((Number(originalPrice) || 0) * (1 + (Number(marginPercent) || 0) / 100)).toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Min Quantity
                  </label>
                  <input
                    type="number"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Max Quantity
                  </label>
                  <input
                    type="number"
                    value={maxQuantity}
                    onChange={(e) => setMaxQuantity(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Description / Service Details
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl text-xs hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Margin Modal */}
      {showBulkMarginModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2">
              Update Bulk Profit Margin
            </h3>

            <form onSubmit={handleSaveBulkMargin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Global Profit Margin (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={bulkMarginInput}
                    onChange={(e) => setBulkMarginInput(e.target.value)}
                    placeholder="20"
                    min="0"
                    max="500"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <span className="absolute right-3.5 top-2.5 font-bold text-gray-400 text-sm">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  This will instantly recalculate final prices for all services based on their original API costs + this margin %.
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkMarginModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl text-xs hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Applying...' : 'Apply To All Services'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
