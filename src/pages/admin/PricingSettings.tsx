import React, { useState, useEffect } from 'react';
import { Percent, Save, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const PricingSettings: React.FC = () => {
  const { pricing, updatePricing } = useSettings();
  const [margin, setMargin] = useState<number>(pricing?.globalMarginPercent ?? 20);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    if (pricing?.globalMarginPercent !== undefined) {
      setMargin(pricing.globalMarginPercent);
    }
  }, [pricing?.globalMarginPercent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(null);

    try {
      await updatePricing({ globalMarginPercent: Number(margin) });
      setSavedMsg(`Global profit margin updated to ${margin}% for all services!`);
      setTimeout(() => setSavedMsg(null), 4000);
    } catch (err) {
      console.error('Failed to update pricing:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-3">
        <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md">
          <Percent className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900">Global Pricing & Profit Margin Settings</h2>
          <p className="text-xs text-gray-500">Automatically calculate selling prices across all imported API services</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-xl space-y-4">
        {savedMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Global Profit Margin Percentage (%)
            </label>
            <div className="relative">
              <input
                type="number"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                min={0}
                max={500}
                required
              />
              <span className="absolute right-3.5 top-2.5 font-bold text-gray-400 text-sm">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Example: If cost from API provider is ₹100 and margin is 20%, customer selling price will be ₹120.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Global Margin'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
