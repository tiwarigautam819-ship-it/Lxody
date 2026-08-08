import React from 'react';
import { Bell } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const NoticeBanner: React.FC = () => {
  const { website, announcements } = useSettings();

  const notice = website?.noticeText || announcements[0]?.content;
  if (!notice) return null;

  return (
    <div className="bg-amber-500 text-white text-xs sm:text-sm py-2 px-4 shadow-inner flex items-center justify-center space-x-2 font-medium">
      <Bell className="w-4 h-4 animate-bounce shrink-0" />
      <div className="truncate text-center">
        <span>{notice}</span>
      </div>
    </div>
  );
};
