import React from 'react';
import { Bell, Megaphone } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const NoticeBanner: React.FC = () => {
  const { website, announcements } = useSettings();

  const brandName = website?.name || 'AG Tech SMM';
  const notice = website?.noticeText || announcements[0]?.content || 'Welcome to AG Tech SMM - #1 Cheapest & Fastest SMM Services Platform! Instant Automatic Order Processing 24/7.';

  const fullBannerText = `${brandName} Announcement: ${notice}`;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white text-xs py-1.5 px-3 overflow-hidden shadow-xs flex items-center border-b border-amber-600/30 w-full max-w-full">
      <div className="flex items-center space-x-1.5 bg-amber-800/80 px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider shrink-0 mr-3 z-10 shadow-xs border border-amber-300/30">
        <Bell className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
        <span>{brandName}</span>
      </div>
      <div className="flex-1 overflow-hidden whitespace-nowrap relative min-w-0">
        <div className="inline-block animate-marquee pl-4 font-semibold tracking-wide text-amber-50">
          <span className="mx-6 flex-inline items-center gap-1.5">
            <Megaphone className="w-3 h-3 inline text-amber-200 mr-1" />
            {fullBannerText}
          </span>
          <span className="mx-6 text-amber-200 font-bold">★</span>
          <span className="mx-6 flex-inline items-center gap-1.5">
            <Megaphone className="w-3 h-3 inline text-amber-200 mr-1" />
            {fullBannerText}
          </span>
        </div>
      </div>
    </div>
  );
};

