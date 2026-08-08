import React, { useState, useEffect } from 'react';
import { Cpu, Plus, Check, RefreshCw, Key, Trash2 } from 'lucide-react';
import { ApiProvider } from '../../types';

export const ApiProvidersPage: React.FC = () => {
  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [apiUrl, setApiUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleDeleteProvider = async (id: string, providerName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${providerName}"?`)) return;
    setDeletingId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/api-providers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}` }
      });
      const data = await res.json();
      if (data.message) {
        setMessage(data.message);
        await fetchProviders();
      }
    } catch (err) {
      console.error('Failed to delete provider:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/api-providers/${id}/test`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}` }
      });
      const data = await res.json();
      if (data.message) {
        setMessage(data.message);
      }
    } catch (err) {
      console.error('Failed to test connection:', err);
    } finally {
      setTestingId(null);
    }
  };

  const handleSyncServices = async (id: string) => {
    setSyncingId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/api-providers/${id}/sync-services`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}` }
      });
      const data = await res.json();
      if (data.message) {
        setMessage(data.message);
      }
    } catch (err) {
      console.error('Failed to sync services:', err);
    } finally {
      setSyncingId(null);
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/admin/api-providers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProviders(data.providers || []);
        }
      }
    } catch (err) {
      console.error('Failed to load API providers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/api-providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}`
        },
        body: JSON.stringify({ name, apiUrl, apiKey, enabled: true })
      });

      if (res.ok) {
        setShowModal(false);
        setName('');
        setApiUrl('');
        setApiKey('');
        await fetchProviders();
      }
    } catch (err) {
      console.error('Failed to add provider:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">SMM API Providers Management</h2>
            <p className="text-xs text-gray-500">Connect upstream SMM provider APIs to automate order processing & sync</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Provider API</span>
        </button>
      </div>

      {message && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-2xl text-xs font-bold flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-indigo-500 hover:text-indigo-700">
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">Loading API providers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 uppercase text-[11px] font-bold">
                  <th className="py-3 px-4">Provider Name</th>
                  <th className="py-3 px-4">API Endpoint URL</th>
                  <th className="py-3 px-4">API Key</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {providers.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{p.name}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-600 text-xs truncate max-w-xs">{p.apiUrl}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-500 text-xs">
                      ••••••••{p.apiKey.slice(-4)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleTestConnection(p.id)}
                          disabled={testingId === p.id}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer disabled:opacity-50"
                        >
                          {testingId === p.id ? 'Testing...' : 'Test Connection'}
                        </button>
                        <button
                          onClick={() => handleSyncServices(p.id)}
                          disabled={syncingId === p.id}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${syncingId === p.id ? 'animate-spin' : ''}`} />
                          <span>{syncingId === p.id ? 'Syncing...' : 'Sync Services'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProvider(p.id, p.name)}
                          disabled={deletingId === p.id}
                          className="bg-red-50 hover:bg-red-100 text-red-600 font-bold p-1.5 rounded-lg text-xs flex items-center justify-center cursor-pointer disabled:opacity-50"
                          title="Delete API Provider"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2">Add SMM Provider API</h3>

            <form onSubmit={handleAddProvider} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Provider Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Main SMM Provider"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  API Endpoint URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://provider-domain.com/api/v2"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Paste Provider API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl text-xs hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Provider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
