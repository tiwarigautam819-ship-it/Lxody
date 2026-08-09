import React, { useState } from 'react';
import { QrCode, Save, CheckCircle2, QrCode as QrIcon, Upload, Wand2, AlertTriangle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const PaymentSettingsPage: React.FC = () => {
  const { payment, updatePayment } = useSettings();

  const [qrCodeUrl, setQrCodeUrl] = useState<string>(payment?.qrCodeUrl || '');
  const [upiId, setUpiId] = useState<string>(payment?.upiId || '');
  const [minDeposit, setMinDeposit] = useState<number>(payment?.minDeposit || 10);
  const [maxDeposit, setMaxDeposit] = useState<number>(payment?.maxDeposit || 50000);
  const [instructions, setInstructions] = useState<string>(payment?.instructions || '');

  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [imgFailed, setImgFailed] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 400;
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
            const compressed = canvas.toDataURL('image/png', 0.85);
            setQrCodeUrl(compressed);
            setImgFailed(false);
          }
        };
        if (typeof event.target?.result === 'string') {
          img.src = event.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateUPIQR = () => {
    const targetUpi = upiId.trim() || 'agtech@upi';
    const generatedUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=upi://pay?pa=${encodeURIComponent(targetUpi)}&pn=AGTechSMM`;
    setQrCodeUrl(generatedUrl);
    setImgFailed(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const finalQr = qrCodeUrl.trim() || `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=upi://pay?pa=${encodeURIComponent(upiId.trim() || 'agtech@upi')}&pn=AGTechSMM`;
      await updatePayment({
        qrCodeUrl: finalQr,
        upiId: upiId.trim(),
        minDeposit: Number(minDeposit),
        maxDeposit: Number(maxDeposit),
        instructions
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update payment settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const displayQrSrc = imgFailed || !qrCodeUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=upi://pay?pa=${encodeURIComponent(upiId.trim() || 'agtech@upi')}&pn=AGTechSMM`
    : qrCodeUrl;

  return (
    <div className="space-y-5">

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-3">
        <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md">
          <QrCode className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900">QR Code & Payment Settings</h2>
          <p className="text-xs text-gray-500">Configure deposit QR code, UPI ID, deposit limits and payment guidelines</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Live Preview Card */}
        <div className="md:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Live QR Preview</h3>

          <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200">
            <img
              src={displayQrSrc}
              alt="Live Payment QR"
              onError={() => setImgFailed(true)}
              className="w-48 h-48 object-contain rounded-xl"
            />
            {imgFailed && (
              <div className="mt-2 text-[11px] text-amber-600 font-bold bg-amber-50 p-1.5 rounded-lg flex items-center justify-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Link failed. Showing auto-generated UPI QR</span>
              </div>
            )}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 w-full text-center">
            <p className="text-[10px] font-bold uppercase text-gray-400">UPI ID</p>
            <p className="text-xs font-black text-gray-900 font-mono">{upiId || 'Not Configured'}</p>
          </div>
        </div>

        {/* Form Settings */}
        <div className="md:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          {saved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Payment settings updated successfully! Changes are live on the User Add Funds page.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                UPI ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. agtech@upi or 9876543210@ybl"
                value={upiId}
                onChange={(e) => {
                  setUpiId(e.target.value);
                  setImgFailed(false);
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Payment QR Code Image
                </label>
                <button
                  type="button"
                  onClick={handleGenerateUPIQR}
                  className="text-indigo-600 hover:text-indigo-800 text-xs font-extrabold flex items-center space-x-1 cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Auto-Generate from UPI</span>
                </button>
              </div>

              {/* Upload image file directly */}
              <div className="mb-2">
                <label className="flex items-center justify-center space-x-2 w-full bg-indigo-50 border-2 border-dashed border-indigo-200 hover:border-indigo-400 p-3 rounded-xl cursor-pointer text-indigo-700 font-bold text-xs transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Upload QR Image File from Device (PNG, JPG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-center text-[10px] text-gray-400 font-bold uppercase my-1">OR PASTE IMAGE URL BELOW</div>

              <input
                type="text"
                placeholder="https://example.com/qr-code.png or upload file above"
                value={qrCodeUrl}
                onChange={(e) => {
                  setQrCodeUrl(e.target.value);
                  setImgFailed(false);
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                You can directly upload a photo file of your GPay / PhonePe / Paytm QR code, or paste an image link.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Min Deposit Limit (₹)
                </label>
                <input
                  type="number"
                  value={minDeposit}
                  onChange={(e) => setMinDeposit(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Max Deposit Limit (₹)
                </label>
                <input
                  type="number"
                  value={maxDeposit}
                  onChange={(e) => setMaxDeposit(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Payment Instructions text
              </label>
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save QR & Payment Settings'}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
