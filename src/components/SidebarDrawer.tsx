import React, { useState } from 'react';
import {
  PlusCircle,
  Layers,
  ShoppingBag,
  RotateCcw,
  List,
  Wallet,
  LifeBuoy,
  Code2,
  User as UserIcon,
  Shield,
  LogOut,
  X,
  Home,
  Info,
  PhoneCall,
  Share2,
  MessageCircle,
  Send,
  Instagram,
  Youtube,
  Facebook,
  Twitter,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Globe,
  Link2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  activePage: string;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  activePage
}) => {
  const { user, logout } = useAuth();
  const { website, socialLinks } = useSettings();
  const [showSocialSection, setShowSocialSection] = useState<boolean>(true);

  if (!isOpen) return null;

  const brandName = website?.name || 'AG Tech SMM';

  const handleItemClick = (page: string) => {
    onNavigate(page);
    onClose();
  };

  const getPlatformIcon = (platformStr: string) => {
    const p = platformStr.toLowerCase();
    if (p.includes('whatsapp')) return { Icon: MessageCircle, color: 'text-emerald-600 bg-emerald-50' };
    if (p.includes('telegram')) return { Icon: Send, color: 'text-sky-500 bg-sky-50' };
    if (p.includes('instagram')) return { Icon: Instagram, color: 'text-pink-600 bg-pink-50' };
    if (p.includes('youtube')) return { Icon: Youtube, color: 'text-red-600 bg-red-50' };
    if (p.includes('facebook')) return { Icon: Facebook, color: 'text-blue-600 bg-blue-50' };
    if (p.includes('twitter') || p.includes('x')) return { Icon: Twitter, color: 'text-slate-800 bg-slate-100' };
    if (p.includes('email') || p.includes('mail')) return { Icon: Mail, color: 'text-amber-600 bg-amber-50' };
    return { Icon: Link2, color: 'text-indigo-600 bg-indigo-50' };
  };

  const enabledSocialLinks = socialLinks.filter((l) => l.enabled !== false && l.url);

  const navItems = user
    ? [
        { id: 'dashboard', label: 'New Order', icon: PlusCircle },
        { id: 'my-orders', label: 'Orders History', icon: ShoppingBag },
        { id: 'add-funds', label: 'Add Funds (Deposit)', icon: Wallet },
        { id: 'transactions', label: 'Transactions', icon: RotateCcw },
        { id: 'services', label: 'Services & Rates', icon: List },
        { id: 'tickets', label: 'Support Tickets', icon: LifeBuoy },
        { id: 'api-doc', label: 'API Docs', icon: Code2 },
        { id: 'profile', label: 'Account Profile', icon: UserIcon }
      ]
    : [
        { id: 'landing', label: 'Home', icon: Home },
        { id: 'services', label: 'Services', icon: List },
        { id: 'contact', label: 'Contact Us', icon: PhoneCall },
        { id: 'login', label: 'Login', icon: UserIcon },
        { id: 'register', label: 'Sign Up', icon: PlusCircle }
      ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-64 sm:w-72 bg-white shadow-2xl flex flex-col justify-between border-r border-gray-100 transform transition-transform animate-in slide-in-from-left duration-200 overflow-y-auto">
          
          {/* Drawer Header */}
          <div>
            <div className="p-4 bg-[#1e60d5] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {website?.logoUrl ? (
                  <img src={website.logoUrl} alt={brandName} className="h-8 max-w-[90px] object-contain shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-white text-sm shrink-0">
                    AG
                  </div>
                )}
                <div>
                  <h2 className="font-bold text-base leading-tight truncate max-w-[130px]">{brandName}</h2>
                  <p className="text-[11px] text-blue-100 opacity-90">Panel Dashboard</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info Bar if logged in */}
            {user && (
              <div className="px-4 py-3 bg-blue-50/70 border-b border-blue-100/60 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Wallet Balance</p>
                  <p className="font-extrabold text-sm text-emerald-700">₹{user.walletBalance.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handleItemClick('add-funds')}
                  className="bg-[#28a745] hover:bg-[#218838] text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-2xs cursor-pointer"
                >
                  + Add
                </button>
              </div>
            )}

            {/* Menu List */}
            <nav className="divide-y divide-gray-100 py-2">
              <div className="py-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full text-left px-5 py-2.5 text-sm font-medium flex items-center space-x-3 transition-all cursor-pointer ${
                        isActive
                          ? 'text-[#1e60d5] bg-blue-50/80 font-bold border-l-4 border-[#1e60d5]'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#1e60d5]' : 'text-gray-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Social Accounts & Custom Links Section */}
              <div className="py-2 px-3">
                <button
                  onClick={() => setShowSocialSection(!showSocialSection)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-extrabold text-gray-500 uppercase tracking-wider hover:text-gray-800 cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Social Accounts & Links</span>
                  </div>
                  {showSocialSection ? (
                    <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>

                {showSocialSection && (
                  <div className="mt-1 space-y-1">
                    {enabledSocialLinks.length === 0 ? (
                      <p className="text-[11px] text-gray-400 italic px-2 py-1">No links added by admin yet</p>
                    ) : (
                      enabledSocialLinks.map((link) => {
                        const { Icon, color } = getPlatformIcon(link.platform);
                        const labelText = link.title || link.platform;
                        return (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-100 text-xs text-gray-800 font-semibold transition-colors group"
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="truncate group-hover:text-indigo-600">{labelText}</span>
                            </div>
                            <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-indigo-600 shrink-0" />
                          </a>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Admin Panel Button if admin */}
              {user && user.role === 'admin' && (
                <div className="py-2">
                  <button
                    onClick={() => handleItemClick('admin')}
                    className="w-full text-left px-5 py-3 text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 flex items-center space-x-3 transition-colors border-l-4 border-indigo-600 cursor-pointer"
                  >
                    <Shield className="w-5 h-5 text-indigo-600" />
                    <span>Admin Control Panel</span>
                  </button>
                </div>
              )}
            </nav>
          </div>

          {/* Drawer Footer */}
          {user ? (
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => {
                  logout();
                  handleItemClick('login');
                }}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center space-x-2.5 transition-colors border border-red-200/60 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="p-4 border-t border-gray-100 text-center text-xs text-gray-500">
              © 2026 {brandName}. All rights reserved.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

