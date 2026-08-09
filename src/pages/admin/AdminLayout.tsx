import React from 'react';
import {
  LayoutDashboard,
  Users,
  Wallet,
  ShoppingBag,
  List,
  Cpu,
  Percent,
  QrCode,
  Globe,
  Share2,
  LifeBuoy,
  ArrowLeft,
  Shield,
  Video
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onNavigateUserDashboard: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onNavigateUserDashboard,
  children
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'fund-requests', label: 'Fund Requests (UTR)', icon: Wallet },
    { id: 'orders', label: 'Orders Management', icon: ShoppingBag },
    { id: 'services', label: 'Services & Rates', icon: List },
    { id: 'api-providers', label: 'SMM API Providers', icon: Cpu },
    { id: 'pricing', label: 'Pricing & Margins', icon: Percent },
    { id: 'payment-settings', label: 'QR Code & Payment', icon: QrCode },
    { id: 'website-settings', label: 'Website Settings', icon: Globe },
    { id: 'videos', label: 'Tutorial Videos', icon: Video },
    { id: 'social-links', label: 'Social & Contact Links', icon: Share2 },
    { id: 'tickets', label: 'Support Tickets', icon: LifeBuoy }
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col md:flex-row w-full max-w-full overflow-x-hidden">

      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-200 shrink-0 border-r border-slate-800">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base leading-tight">Admin Control</h1>
              <p className="text-[10px] text-slate-400">AG Tech SMM Panel</p>
            </div>
          </div>

          <button
            onClick={onNavigateUserDashboard}
            className="text-xs text-indigo-400 hover:text-white font-bold flex items-center space-x-1 md:hidden"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>User Panel</span>
          </button>
        </div>

        <nav className="p-2 flex md:flex-col overflow-x-auto md:overflow-x-visible space-x-1.5 md:space-x-0 md:space-y-1 no-scrollbar shrink-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2.5 transition-colors shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 hidden md:block">
          <button
            onClick={onNavigateUserDashboard}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Return to User Panel</span>
          </button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto w-full max-w-full min-w-0 overflow-x-hidden">
        {children}
      </main>

    </div>
  );
};
