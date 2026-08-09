import React, { useState } from 'react';
import { Menu, ChevronDown, User as UserIcon, Shield, LogOut, Wallet, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { NotificationBell } from './NotificationBell';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNavigate: (page: string) => void;
  activePage: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onNavigate, activePage }) => {
  const { user, logout } = useAuth();
  const { website } = useSettings();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const brandName = website?.name || 'AG Tech SMM';
  const balanceStr = user ? `₹${user.walletBalance.toFixed(2)}` : '₹0.00';
  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'G';

  return (
    <header className="sticky top-0 z-40 bg-[#1e60d5] text-white shadow-md w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between min-w-0">
        {/* Left Section: Menu Toggle & Logo */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-white hover:bg-blue-600/80 focus:outline-none transition-colors shrink-0"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
            className="flex items-center space-x-1.5 text-left focus:outline-none group min-w-0"
          >
            {website?.logoUrl ? (
              <img src={website.logoUrl} alt={brandName} className="h-7 sm:h-8 max-w-[100px] sm:max-w-[130px] object-contain shrink-0" />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-white text-xs sm:text-base shadow-xs shrink-0">
                AG
              </div>
            )}
            <span className="font-extrabold text-sm sm:text-lg tracking-tight text-white group-hover:text-blue-100 transition-colors truncate max-w-[110px] sm:max-w-none">
              {brandName}
            </span>
          </button>
        </div>

        {/* Right Section: Balance Pill & User Dropdown */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
          {user ? (
            <>
              {/* Notification Bell */}
              <NotificationBell onNavigate={onNavigate} />

              {/* Green Wallet Pill */}
              <button
                onClick={() => onNavigate('add-funds')}
                className="bg-[#28a745] hover:bg-[#218838] text-white font-bold text-sm px-3.5 py-1.5 rounded-md shadow-xs flex items-center space-x-1.5 transition-all transform active:scale-95 cursor-pointer"
                title="Add Funds"
              >
                <Wallet className="w-4 h-4" />
                <span>{balanceStr}</span>
                <PlusCircle className="w-3.5 h-3.5 opacity-90" />
              </button>

              {/* User Avatar Circle */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-1 focus:outline-none p-1 rounded-full hover:bg-blue-600/60 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#d93025] text-white font-bold text-sm flex items-center justify-center shadow-xs border-2 border-white/20">
                    {firstLetter}
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/90" />
                </button>

                {/* User Dropdown Menu */}
                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-gray-800 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/80">
                        <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        {user.role === 'admin' && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-100 text-amber-800 rounded-full">
                            Admin Account
                          </span>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onNavigate('dashboard');
                          }}
                          className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2.5 hover:bg-gray-50 ${
                            activePage === 'dashboard' ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-gray-700'
                          }`}
                        >
                          <UserIcon className="w-4 h-4 text-gray-500" />
                          <span>User Dashboard</span>
                        </button>

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onNavigate('add-funds');
                          }}
                          className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2.5 hover:bg-gray-50 cursor-pointer ${
                            activePage === 'add-funds' ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-gray-700'
                          }`}
                        >
                          <Wallet className="w-4 h-4 text-emerald-600" />
                          <span>Add Funds</span>
                        </button>

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onNavigate('profile');
                          }}
                          className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2.5 hover:bg-gray-50 ${
                            activePage === 'profile' ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-gray-700'
                          }`}
                        >
                          <UserIcon className="w-4 h-4 text-gray-500" />
                          <span>Account Settings</span>
                        </button>

                        {user.role === 'admin' && (
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              onNavigate('admin');
                            }}
                            className="w-full text-left px-4 py-2 text-sm flex items-center space-x-2.5 text-indigo-600 font-semibold hover:bg-indigo-50 border-t border-gray-100 my-1"
                          >
                            <Shield className="w-4 h-4 text-indigo-600" />
                            <span>Admin Panel</span>
                          </button>
                        )}
                      </div>

                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                            onNavigate('login');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2.5 font-medium"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigate('login')}
                className="text-white hover:bg-blue-600 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="bg-white text-[#1e60d5] hover:bg-blue-50 font-bold text-sm px-3.5 py-1.5 rounded-lg shadow-xs transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
