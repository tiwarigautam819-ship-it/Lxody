import React, { useState } from 'react';
import { Code2, Key, Copy, Check, Terminal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ApiDocPage: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState<boolean>(false);

  const mockApiKey = user ? `ag_live_${user.id.replace('usr_', '')}_key987` : 'ag_live_demo_key';

  const handleCopy = () => {
    navigator.clipboard.writeText(mockApiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] py-6 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#1e60d5] text-white rounded-xl flex items-center justify-center shadow-md">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">API Documentation</h2>
              <p className="text-xs text-gray-500">Integrate AG Tech SMM API v2 to automate orders programmatically</p>
            </div>
          </div>
        </div>

        {/* API Key Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
            <Key className="w-4 h-4 text-[#1e60d5]" />
            <span>Your Personal API Key</span>
          </h3>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={mockApiKey}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-mono text-sm font-bold text-gray-900 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="bg-[#1e60d5] hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Key'}</span>
            </button>
          </div>
        </div>

        {/* Endpoint Specs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h3 className="text-base font-black text-gray-900 flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-emerald-600" />
            <span>API Endpoints Reference</span>
          </h3>

          {/* Endpoint 1 */}
          <div className="space-y-2 border-b border-gray-100 pb-4">
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-md font-mono">
                POST
              </span>
              <code className="text-sm font-bold font-mono text-gray-800">/api/v2?action=add</code>
            </div>
            <p className="text-xs text-gray-600">Place a new order via SMM Panel API protocol.</p>

            <div className="bg-gray-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto space-y-1">
              <p className="text-gray-400">// Request Parameters (POST form-data or JSON):</p>
              <p>key = "{mockApiKey}"</p>
              <p>action = "add"</p>
              <p>service = "srv_1"</p>
              <p>link = "https://instagram.com/p/..."</p>
              <p>quantity = 1000</p>
            </div>
          </div>

          {/* Endpoint 2 */}
          <div className="space-y-2 border-b border-gray-100 pb-4">
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-md font-mono">
                POST
              </span>
              <code className="text-sm font-bold font-mono text-gray-800">/api/v2?action=balance</code>
            </div>
            <p className="text-xs text-gray-600">Check current wallet balance and currency.</p>
          </div>

          {/* Endpoint 3 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-md font-mono">
                POST
              </span>
              <code className="text-sm font-bold font-mono text-gray-800">/api/v2?action=services</code>
            </div>
            <p className="text-xs text-gray-600">Get complete list of active services and rates.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
