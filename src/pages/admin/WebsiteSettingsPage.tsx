import React, { useState } from 'react';
import {
  Globe,
  Save,
  CheckCircle2,
  Upload,
  ShieldAlert,
  KeyRound,
  Server
} from 'lucide-react';
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

  // =========================
  // NEWSMM API SETTINGS
  // =========================
  const [apiName, setApiName] = useState<string>(
    website?.apiServices?.name || 'Newsmm'
  );

  const [apiUrl, setApiUrl] = useState<string>(
    website?.apiServices?.url || 'https://universeofsmm.com/api/v2'
  );

  const [apiKey, setApiKey] = useState<string>(
    website?.apiServices?.key || ''
  );

  const [apiEnabled, setApiEnabled] = useState<boolean>(
    website?.apiServices?.enabled ?? true
  );

  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  // =========================
  // LOGO UPLOAD
  // =========================
  const handleLogoUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');

        const maxDim = 320;

        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL(
            'image/png',
            0.85
          );

          setLogoUrl(compressed);
        }
      };

      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };

    reader.readAsDataURL(file);
  };

  // =========================
  // FAVICON UPLOAD
  // =========================
  const handleFaviconUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');

        const maxDim = 128;

        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL(
            'image/png',
            0.85
          );

          setFaviconUrl(compressed);
        }
      };

      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };

    reader.readAsDataURL(file);
  };

  // =========================
  // SAVE SETTINGS
  // =========================
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
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
        footerText,

        // NEWSMM API
        apiServices: {
          name: apiName,
          url: apiUrl,
          key: apiKey,
          enabled: apiEnabled
        }
      });

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);

    } catch (err) {
      console.error(
        'Failed to update website settings:',
        err
      );

      alert('Failed to save website settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-3">

        <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md">
          <Globe className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-xl font-black text-gray-900">
            Website Branding & Content Settings
          </h2>

          <p className="text-xs text-gray-500">
            Dynamically update website branding, content,
            contact information and API settings
          </p>
        </div>

      </div>

      {/* MAIN SETTINGS */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">

        {/* SAVED MESSAGE */}
        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">

            <CheckCircle2 className="w-4 h-4 text-emerald-600" />

            <span>
              Website settings saved successfully!
            </span>

          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* NAME + NOTICE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>

              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Website Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
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
                onChange={(e) =>
                  setNoticeText(e.target.value)
                }
                placeholder="⚡ Welcome to AG Tech SMM Panel!"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />

            </div>

          </div>

          {/* LOGO */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">

            <div className="flex items-center justify-between">

              <div>

                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                  Website Branding Logo
                </h4>

                <p className="text-[11px] text-gray-500">
                  Upload a logo or paste an image URL
                </p>

              </div>

              {logoUrl && (
                <div className="bg-white p-2 rounded-xl border border-gray-200 flex items-center space-x-2">

                  <span className="text-[10px] text-gray-400 font-bold uppercase">
                    Preview:
                  </span>

                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    className="h-7 max-w-[120px] object-contain"
                  />

                </div>
              )}

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              <label className="flex items-center justify-center space-x-2 w-full bg-indigo-50 border-2 border-dashed border-indigo-200 hover:border-indigo-400 p-2.5 rounded-xl cursor-pointer text-indigo-700 font-bold text-xs">

                <Upload className="w-4 h-4" />

                <span>
                  Upload Logo
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

              </label>

              <input
                type="text"
                value={logoUrl}
                onChange={(e) =>
                  setLogoUrl(e.target.value)
                }
                placeholder="https://.../logo.png"
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />

            </div>

          </div>

          {/* DESCRIPTION */}
          <div>

            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Website Short Description
            </label>

            <textarea
              rows={2}
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />

          </div>

          {/* ABOUT */}
          <div>

            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              About Us Details
            </label>

            <textarea
              rows={3}
              value={aboutUs}
              onChange={(e) =>
                setAboutUs(e.target.value)
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />

          </div>

          {/* CONTACT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>

              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Contact Email
              </label>

              <input
                type="email"
                value={contactEmail}
                onChange={(e) =>
                  setContactEmail(e.target.value)
                }
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
                onChange={(e) =>
                  setContactPhone(e.target.value)
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />

            </div>

          </div>

          {/* ================================================= */}
          {/* NEWSMM API SERVICE */}
          {/* ================================================= */}

          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>

                <div>

                  <h3 className="text-sm font-black text-gray-900 uppercase">
                    API Service
                  </h3>

                  <p className="text-[11px] text-gray-500">
                    Configure external SMM API provider
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setApiEnabled(!apiEnabled)
                }
                className={`px-4 py-2 rounded-xl text-xs font-extrabold ${
                  apiEnabled
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {apiEnabled
                  ? 'ACTIVE'
                  : 'DISABLED'}
              </button>

            </div>

            {/* API NAME + URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  API Name
                </label>

                <input
                  type="text"
                  value={apiName}
                  onChange={(e) =>
                    setApiName(e.target.value)
                  }
                  placeholder="Newsmm"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />

              </div>

              <div>

                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  API URL
                </label>

                <input
                  type="url"
                  value={apiUrl}
                  onChange={(e) =>
                    setApiUrl(e.target.value)
                  }
                  placeholder="https://example.com/api/v2"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />

              </div>

            </div>

            {/* API KEY */}
            <div>

              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">

                <KeyRound className="w-4 h-4" />

                API Key

              </label>

              <input
                type="password"
                value={apiKey}
                onChange={(e) =>
                  setApiKey(e.target.value)
                }
                placeholder="Enter API key"
                autoComplete="new-password"
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />

              <div className="mt-2 flex items-start gap-2 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">

                <ShieldAlert className="w-4 h-4 flex-shrink-0" />

                <span>
                  Keep your API key private. For production,
                  store the key on your backend instead of
                  exposing it in the browser.
                </span>

              </div>

            </div>

            {/* API PROVIDER INFO */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">

              <div className="flex items-center justify-between mb-3">

                <span className="text-xs font-black text-gray-700 uppercase">
                  Provider
                </span>

                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                    apiEnabled
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {apiEnabled
                    ? 'ACTIVE'
                    : 'OFF'}
                </span>

              </div>

              <div className="space-y-2 text-xs">

                <div className="flex justify-between gap-4">

                  <span className="text-gray-500">
                    API Name
                  </span>

                  <span className="font-bold text-gray-900">
                    {apiName || 'Not configured'}
                  </span>

                </div>

                <div className="flex justify-between gap-4">

                  <span className="text-gray-500">
                    Endpoint
                  </span>

                  <span className="font-mono text-gray-700 break-all text-right">
                    {apiUrl || 'Not configured'}
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* FOOTER */}
          <div>

            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Footer Copyright Text
            </label>

            <input
              type="text"
              value={footerText}
              onChange={(e) =>
                setFooterText(e.target.value)
              }
              placeholder="© 2026 AG Tech SMM"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />

          </div>

          {/* SAVE */}
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50 flex items-center space-x-2"
          >

            <Save className="w-4 h-4" />

            <span>
              {saving
                ? 'Saving...'
                : 'Save Website Settings'}
            </span>

          </button>

        </form>

      </div>

    </div>
  );
};