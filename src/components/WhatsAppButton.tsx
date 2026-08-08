import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const WhatsAppButton: React.FC = () => {
  const { socialLinks, website } = useSettings();

  const waLink = socialLinks.find((s) => s.platform === 'WhatsApp' && s.enabled);
  const targetUrl = waLink?.url || `https://wa.me/919876543210?text=Hello%20${encodeURIComponent(website?.name || 'AG Tech SMM')}%20Support`;

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 group"
      title="Contact WhatsApp Support"
      aria-label="Contact WhatsApp Support"
    >
      <MessageCircle className="w-7 h-7 fill-white text-[#25D366]" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-xs pl-0 group-hover:pl-2">
        Chat with Us
      </span>
    </a>
  );
};
