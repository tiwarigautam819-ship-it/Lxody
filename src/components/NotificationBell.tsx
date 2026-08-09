import React, { useState, useEffect } from 'react';
import { Bell, Check, Mail, ExternalLink, RefreshCw, CheckCheck, Sparkles } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationBellProps {
  onNavigate: (page: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('ag_auth_token');
      if (!token) return;

      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Auto refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ag_auth_token');
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string, link?: string) => {
    try {
      const token = localStorage.getItem('ag_auth_token');
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchNotifications();
      if (link) {
        setIsOpen(false);
        onNavigate(link.replace('/', ''));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 rounded-full text-white/90 hover:text-white hover:bg-blue-600/60 transition-colors focus:outline-none cursor-pointer"
        title="Email & App Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center border-2 border-[#1e60d5] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Drawer */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 py-0 z-50 overflow-hidden text-gray-800 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight flex items-center space-x-1.5">
                    <span>Email & Notifications</span>
                    <span className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                      Firebase
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Order updates & Support ticket emails</p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    disabled={loading}
                    className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-slate-800 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Read all</span>
                  </button>
                )}
                <button
                  onClick={fetchNotifications}
                  className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
                  title="Refresh notifications"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Sparkles className="w-8 h-8 text-blue-400 mx-auto opacity-40" />
                  <p className="text-xs font-bold text-gray-500">No email notifications yet</p>
                  <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                    You'll receive email & in-app alerts when admins reply to support tickets or update order statuses.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkRead(notif.id, notif.link)}
                    className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start space-x-3 relative ${
                      !notif.read ? 'bg-blue-50/40' : 'bg-white'
                    }`}
                  >
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    )}

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-900 leading-tight">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 leading-snug line-clamp-2">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center space-x-1">
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Firebase Email Sent</span>
                        </span>

                        <span className="text-[10px] font-bold text-blue-600 hover:underline flex items-center space-x-0.5">
                          <span>View</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center text-[11px] text-gray-500 font-medium flex items-center justify-between px-4">
              <span>Firebase Cloud Functions active</span>
              <span className="font-bold text-gray-700">{notifications.length} total alerts</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
