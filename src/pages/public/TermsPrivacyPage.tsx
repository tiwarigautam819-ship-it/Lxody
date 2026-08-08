import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const TermsPrivacyPage: React.FC = () => {
  const { website } = useSettings();
  const brandName = website?.name || 'AG Tech SMM';

  return (
    <div className="min-h-screen bg-[#F4F6F9] py-8 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#1e60d5] text-white rounded-xl flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Terms & Conditions & Privacy Policy</h2>
            <p className="text-xs text-gray-500">Legal agreements for using {brandName}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 text-gray-700 text-xs sm:text-sm space-y-4 leading-relaxed">
          <h3 className="text-base font-extrabold text-gray-900">1. Terms of Service</h3>
          <p>
            By placing an order with {brandName}, you automatically accept all the below-listed terms of service whether you read them or not.
          </p>

          <h3 className="text-base font-extrabold text-gray-900">2. Service Usage</h3>
          <p>
            {brandName} will only be used to promote your Instagram, YouTube, Telegram, Facebook, TikTok or other social accounts. Account links provided must be PUBLIC during order processing.
          </p>

          <h3 className="text-base font-extrabold text-gray-900">3. Deposit & Wallet Policy</h3>
          <p>
            Deposits made via UPI or manual payment verification are added to your wallet balance. Payments are non-refundable once credited. In case an order fails or gets canceled, funds are automatically refunded to your wallet balance.
          </p>

          <h3 className="text-base font-extrabold text-gray-900">4. Privacy Policy</h3>
          <p>
            We take your privacy seriously and will take all measures to protect your personal information. Any personal information received will only be used to fill your order. We will not sell or redistribute your information to anyone.
          </p>
        </div>

      </div>
    </div>
  );
};
