import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center py-10 px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-6 sm:p-8 space-y-6">

        <button
          onClick={() => onNavigate('login')}
          className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-gray-900">Reset Password</h2>
          <p className="text-xs text-gray-500">Enter your account email to receive reset instructions</p>
        </div>

        {submitted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-bold text-sm text-emerald-900">Reset Link Sent!</p>
            <p className="text-xs text-emerald-700">
              If an account exists for <span className="font-bold">{email}</span>, you will receive password reset instructions shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e60d5]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1e60d5] hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-xl text-sm uppercase tracking-wider shadow-md active:scale-98 transition-all cursor-pointer"
            >
              Send Reset Link
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
