import React from 'react';
import { PhoneCall, Mail, MessageCircle, Send, Globe } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface ContactPageProps {
  onNavigate: (page: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = () => {
  const { website, socialLinks } = useSettings();

  return (
    <div className="min-h-screen bg-[#F4F6F9] py-8 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#1e60d5] text-white rounded-xl flex items-center justify-center shadow-md">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Contact & Support</h2>
            <p className="text-xs text-gray-500">Reach out to our team 24/7 for assistance</p>
          </div>
        </div>

        {/* Contact Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-extrabold text-base text-gray-900 border-b border-gray-100 pb-2">Direct Channels</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-50 text-[#1e60d5] rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Email Support</p>
                  <p className="font-extrabold text-gray-800">{website?.contactEmail || 'support@agtechsmm.com'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Phone / WhatsApp</p>
                  <p className="font-extrabold text-gray-800">{website?.contactPhone || '+91 98765 43210'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-extrabold text-base text-gray-900 border-b border-gray-100 pb-2">Social Media Links</h3>

            <div className="space-y-2">
              {socialLinks.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-200/80 transition-colors group"
                >
                  <span className="font-bold text-sm text-gray-800 group-hover:text-[#1e60d5]">{s.platform}</span>
                  <Globe className="w-4 h-4 text-gray-400 group-hover:text-[#1e60d5]" />
                </a>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
