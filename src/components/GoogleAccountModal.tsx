import React, { useState } from 'react';
import { X, User, Mail, ShieldCheck, Sparkles } from 'lucide-react';

interface GoogleAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (email: string, name: string) => Promise<void>;
  defaultEmail?: string;
  defaultName?: string;
}

export const GoogleAccountModal: React.FC<GoogleAccountModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  defaultEmail = '',
  defaultName = ''
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [name, setName] = useState(defaultName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid Google email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSelectAccount(email.trim(), name.trim() || email.split('@')[0]);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = async (quickEmail: string, quickName: string) => {
    setError('');
    setLoading(true);
    try {
      await onSelectAccount(quickEmail, quickName);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Google Header */}
        <div className="bg-slate-50 p-6 border-b border-gray-100 text-center space-y-2">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-black text-gray-900">Sign in with Google</h3>
          <p className="text-xs text-gray-500 font-medium">Choose a Google Account to continue to AG Tech SMM</p>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Manual Google Account Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Your Google Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-xl text-xs sm:text-sm tracking-wider uppercase shadow-md active:scale-98 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{loading ? 'AUTHENTICATING...' : 'CONTINUE WITH GOOGLE'}</span>
            </button>
          </form>

          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-gray-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure 1-Click OAuth Login via AG Tech SMM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
