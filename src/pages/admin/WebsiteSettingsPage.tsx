import React, { useState } from 'react';
import { Globe, Save, CheckCircle2, Upload, Image, ShieldAlert } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const WebsiteSettingsPage: React.FC = () => {
  const { website, updateWebsite } = useSettings();

  const [name, setName] = useState<string>(website?.name || 'AG Tech SMM');
  const [logoUrl, setLogoUrl] = useState<string>(website?.logoUrl || '');
  const [faviconUrl, setFaviconUrl] = useState<string>(website?.faviconUrl || '');
  const [description, setDescription] = useState<string>(website?.description || '');
  const [noticeText, setNoticeText] = useState<string>(website?.noticeText || '');
  const [aboutUs, setAboutUs] = useState<string>(website?.aboutUs || '');
  const [contactEmail, setContactEmail] = useState<string>(website?.contactEmail || '');
  const [contactPhone, setContactPhone] = useState<string>(website?.contactPhone || '');
  const [footerText, setFooterText] = useState<string>(website?.footerText || '');

  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFaviconUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      await updateWebsite({
        name,
        logoUrl,
        faviconUrl,
        description,
        noticeText,
        aboutUs,
        contactEmail,
        contactPhone,
        footerText
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update website settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-3">
        <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900">Website Branding & Content Settings</h2>
          <p className="text-xs text-gray-500">Dynamically update panel title, announcement banner, about text and contact info</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Website settings saved! Changes are reflected immediately across all pages.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Website Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. AG Tech SMM"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Notice Banner Announcement
              </label>
              <input
                type="text"
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                placeholder="e.g. ⚡ Welcome to AG Tech SMM Panel! 24/7 Fast Delivery"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Website Logo Section */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Website Branding Logo</h4>
                <p className="text-[11px] text-gray-500">Upload a logo file or paste an image URL to customize panel logo</p>
              </div>

              {logoUrl && (
                <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-2xs flex items-center space-x-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Preview:</span>
                  <img src={logoUrl} alt="Logo Preview" className="h-7 max-w-[120px] object-contain" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center justify-center space-x-2 w-full bg-indigo-50 border-2 border-dashed border-indigo-200 hover:border-indigo-400 p-2.5 rounded-xl cursor-pointer text-indigo-700 font-bold text-xs transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Upload Logo Image File (PNG, SVG, JPG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="Or paste Logo Image URL (e.g. https://.../logo.png)"
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Website Short Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              About Us Details
            </label>
            <textarea
              rows={3}
              value={aboutUs}
              onChange={(e) => setAboutUs(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Contact Phone / WhatsApp
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Footer Copyright Text
            </label>
            <input
              type="text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Website Settings'}</span>
          </button>
        </form>
      </div>

    </div>
  );
};
