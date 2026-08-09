import React, { useState, useEffect } from 'react';
import { Percent, Save, CheckCircle2, Calculator, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const PricingSettings: React.FC = () => {
  const { pricing, updatePricing } = useSettings();
  const [margin, setMargin] = useState<number>(pricing?.globalMarginPercent ?? 20);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // Interactive Calculator State
  const [sampleCost, setSampleCost] = useState<number>(100);

  useEffect(() => {
    if (pricing?.globalMarginPercent !== undefined) {
      setMargin(pricing.globalMarginPercent);
    }
  }, [pricing?.globalMarginPercent]);

  // Dynamic calculations
  const marginVal = Number(margin) || 0;
  const costVal = Number(sampleCost) || 0;
  const calculatedProfit = (costVal * marginVal) / 100;
  const calculatedSellingPrice = costVal + calculatedProfit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(null);

    try {
      // Send bulk margin update endpoint to update all services in DB & Firestore
      const token = localStorage.getItem('ag_auth_token');
      const res = await fetch('/api/admin/services/bulk-margin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ marginPercent: marginVal })
      });

      const data = await res.json();
      if (data.success) {
        await updatePricing({ globalMarginPercent: marginVal });
        setSavedMsg(`Global profit margin set to ${marginVal}%! All services recalculated successfully.`);
      } else {
        await updatePricing({ globalMarginPercent: marginVal });
        setSavedMsg(`Global profit margin updated to ${marginVal}%.`);
      }
      setTimeout(() => setSavedMsg(null), 5000);
    } catch (err) {
      console.error('Failed to update pricing:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-sm">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Global Profit Margin & Rate Calculator</h2>
            <p className="text-xs text-gray-500">Configure profit margins and auto-calculate customer prices for all SMM services</p>
          </div>
        </div>
      </div>

      {savedMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Margin Settings Form */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-xs border border-gray-100 space-y-5">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-black text-gray-900">Set Global Profit Margin</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Profit Margin Percentage (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base font-extrabold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  min={0}
                  max={1000}
                  step="0.1"
                  required
                />
                <span className="absolute right-4 top-3.5 font-black text-gray-400 text-sm">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Applying this margin will automatically recalculate the selling price for all imported API services as:
                <br />
                <code className="font-mono bg-gray-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold mt-1 inline-block">
                  Final Price = API Cost + (API Cost × {marginVal}%)
                </code>
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Applying To All Services...' : 'Save & Apply Margin To All Services'}</span>
            </button>
          </form>
        </div>

        {/* Live Interactive Calculator */}
        <div className="lg:col-span-6 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-700 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-indigo-700/60 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">Live Rate Calculator</h3>
              </div>
              <span className="text-[10px] font-extrabold uppercase bg-amber-400 text-indigo-950 px-2.5 py-1 rounded-md">
                Interactive Preview
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-indigo-200 uppercase tracking-wide mb-1">
                  Test API Provider Cost (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-indigo-300 text-sm">₹</span>
                  <input
                    type="number"
                    value={sampleCost}
                    onChange={(e) => setSampleCost(Number(e.target.value))}
                    className="w-full bg-indigo-950/80 border border-indigo-600/60 rounded-xl pl-8 pr-4 py-2.5 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    min={0}
                  />
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-indigo-950/60 border border-indigo-700/50 p-3 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-indigo-300 uppercase">Provider Cost</p>
                  <p className="text-lg font-black text-white mt-1">₹{costVal.toFixed(2)}</p>
                </div>

                <div className="bg-indigo-950/60 border border-amber-500/40 p-3 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-amber-300 uppercase">Your Profit ({marginVal}%)</p>
                  <p className="text-lg font-black text-amber-400 mt-1">+₹{calculatedProfit.toFixed(2)}</p>
                </div>

                <div className="bg-emerald-950/60 border border-emerald-500/50 p-3 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-emerald-300 uppercase">Customer Price</p>
                  <p className="text-lg font-black text-emerald-400 mt-1">₹{calculatedSellingPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-950/40 border border-indigo-700/40 p-3.5 rounded-xl text-xs text-indigo-200 flex items-start space-x-2 mt-4">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              When a user places an order, you pay <strong>₹{costVal.toFixed(2)}</strong> to the provider and keep <strong>₹{calculatedProfit.toFixed(2)}</strong> as pure profit!
            </p>
          </div>
        </div>
      </div>

      {/* Sample Price Matrix Table */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 space-y-4">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">
          Sample Cost vs Selling Price Breakdown @ {marginVal}% Margin
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-[11px] font-bold border-b border-gray-100">
                <th className="py-2.5 px-4">API Provider Cost</th>
                <th className="py-2.5 px-4">Your Profit Margin ({marginVal}%)</th>
                <th className="py-2.5 px-4">Your Profit per 1k</th>
                <th className="py-2.5 px-4 text-right">Final Selling Price / 1k</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {[10, 25, 50, 100, 250, 500, 1000].map((cost) => {
                const profit = (cost * marginVal) / 100;
                const finalP = cost + profit;
                return (
                  <tr key={cost} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4 font-bold text-gray-800">₹{cost.toFixed(2)}</td>
                    <td className="py-3 px-4 text-indigo-600 font-bold">+{marginVal}%</td>
                    <td className="py-3 px-4 text-amber-600 font-bold">+₹{profit.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-black text-emerald-700 text-base">
                      ₹{finalP.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

