import React, { useState } from 'react';
import { Share2, Plus, Trash2, CheckCircle2, Globe, ExternalLink, Link2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const SocialLinksPage: React.FC = () => {
  const { socialLinks, updateSocialLinks } = useSettings();

  const [links, setLinks] = useState(socialLinks);
  const [platform, setPlatform] = useState('WhatsApp');
  const [customTitle, setCustomTitle] = useState('');
  const [url, setUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    const displayPlatform = platform === 'Custom' ? (customTitle.trim() || 'Custom Link') : platform;

    const newLink = {
      id: `soc_${Date.now()}`,
      platform: displayPlatform,
      title: customTitle.trim() || displayPlatform,
      url: url.trim(),
      enabled: true
    };

    const updated = [...links, newLink];
    setLinks(updated);
    setUrl('');
    setCustomTitle('');
  };

  const handleToggleEnabled = (id: string) => {
    const updated = links.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l));
    setLinks(updated);
  };

  const handleRemoveLink = (id: string) => {
    const updated = links.filter((l) => l.id !== id);
    setLinks(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      await updateSocialLinks(links);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save social links:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-3">
        <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md shrink-0">
          <Share2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900">Social Media & Custom Links</h2>
          <p className="text-xs text-gray-500">
            Add WhatsApp, Telegram, Instagram, YouTube, or Custom Links to display in the main sidebar 3-line drawer menu
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5 max-w-2xl">
        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Social & Custom links saved successfully!</span>
          </div>
        )}

        {/* Add Form */}
        <form onSubmit={handleAddLink} className="space-y-3 bg-gray-50/80 p-4 rounded-xl border border-gray-200/80">
          <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wide flex items-center space-x-1.5">
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Add New Social or Custom Link</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Platform Type</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Telegram">Telegram</option>
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
                <option value="Facebook">Facebook</option>
                <option value="Twitter">Twitter / X</option>
                <option value="Email">Email Support</option>
                <option value="Custom">Custom Link / Other Platform</option>
              </select>
            </div>

            {platform === 'Custom' && (
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Custom Name / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Discord, Direct APK, VIP Channel"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>
            )}

            <div className={platform === 'Custom' ? 'sm:col-span-2' : ''}>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">URL / Link Target</label>
              <input
                type="url"
                placeholder="https://t.me/yourchannel or https://wa.me/919876543210"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Link To Drawer Menu</span>
          </button>
        </form>

        {/* Existing Links List */}
        <div className="space-y-2 pt-1">
          <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Configured Links ({links.length})</h4>

          {links.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400">
              No links added yet. Add WhatsApp, Telegram or custom links above!
            </div>
          ) : (
            links.map((l) => (
              <div
                key={l.id}
                className={`flex items-center justify-between p-3.5 bg-gray-50 border rounded-xl text-xs ${
                  l.enabled !== false ? 'border-gray-200' : 'border-gray-200 opacity-60 bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-gray-900">{l.title || l.platform}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-700">
                        {l.platform}
                      </span>
                    </div>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-indigo-600 hover:underline truncate text-[11px] flex items-center space-x-1"
                    >
                      <span className="truncate">{l.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleToggleEnabled(l.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                      l.enabled !== false
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {l.enabled !== false ? 'Active' : 'Disabled'}
                  </button>

                  <button
                    onClick={() => handleRemoveLink(l.id)}
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving Links...' : 'Save All Social Links'}
          </button>
        </div>
      </div>

    </div>
  );
};

