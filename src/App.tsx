import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { SidebarDrawer } from './components/SidebarDrawer';
import { NoticeBanner } from './components/NoticeBanner';
import { WhatsAppButton } from './components/WhatsAppButton';

// User & Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { PublicServicesPage } from './pages/public/PublicServicesPage';
import { ContactPage } from './pages/public/ContactPage';
import { TermsPrivacyPage } from './pages/public/TermsPrivacyPage';

import { UserDashboard } from './pages/user/UserDashboard';
import { MyOrdersPage } from './pages/user/MyOrdersPage';
import { AddFundsPage } from './pages/user/AddFundsPage';
import { TransactionHistoryPage } from './pages/user/TransactionHistoryPage';
import { SupportTicketsPage } from './pages/user/SupportTicketsPage';
import { ApiDocPage } from './pages/user/ApiDocPage';
import { ProfilePage } from './pages/user/ProfilePage';

// Admin Panel Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { FundRequestsManagement } from './pages/admin/FundRequestsManagement';
import { OrdersManagement } from './pages/admin/OrdersManagement';
import { ServicesManagement } from './pages/admin/ServicesManagement';
import { ApiProvidersPage } from './pages/admin/ApiProvidersPage';
import { PricingSettings } from './pages/admin/PricingSettings';
import { PaymentSettingsPage } from './pages/admin/PaymentSettingsPage';
import { WebsiteSettingsPage } from './pages/admin/WebsiteSettingsPage';
import { SocialLinksPage } from './pages/admin/SocialLinksPage';
import { AdminTicketsPage } from './pages/admin/AdminTicketsPage';

export function App() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render Admin Panel if on 'admin' page and user is admin
  if (currentPage === 'admin' && user?.role === 'admin') {
    return (
      <AdminLayout
        currentTab={adminTab}
        onSelectTab={(tab) => setAdminTab(tab)}
        onNavigateUserDashboard={() => handleNavigate('dashboard')}
      >
        {adminTab === 'dashboard' && <AdminDashboard onNavigateTab={(tab) => setAdminTab(tab)} />}
        {adminTab === 'users' && <UserManagement />}
        {adminTab === 'fund-requests' && <FundRequestsManagement />}
        {adminTab === 'orders' && <OrdersManagement />}
        {adminTab === 'services' && <ServicesManagement />}
        {adminTab === 'api-providers' && <ApiProvidersPage />}
        {adminTab === 'pricing' && <PricingSettings />}
        {adminTab === 'payment-settings' && <PaymentSettingsPage />}
        {adminTab === 'website-settings' && <WebsiteSettingsPage />}
        {adminTab === 'social-links' && <SocialLinksPage />}
        {adminTab === 'tickets' && <AdminTicketsPage />}
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans antialiased text-gray-900 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Announcement Banner */}
      <NoticeBanner />

      {/* Primary Header */}
      <Header
        activePage={currentPage}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onToggleSidebar={() => setSidebarOpen(true)}
      />

      {/* Slide-out Navigation Drawer for 3-line menu */}
      <SidebarDrawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleNavigate}
        activePage={currentPage}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {currentPage === 'login' && <LoginPage onNavigate={handleNavigate} />}
        {currentPage === 'register' && <RegisterPage onNavigate={handleNavigate} />}
        {currentPage === 'forgot-password' && <ForgotPasswordPage onNavigate={handleNavigate} />}
        {currentPage === 'services' && <PublicServicesPage onNavigate={handleNavigate} />}
        {currentPage === 'contact' && <ContactPage onNavigate={handleNavigate} />}
        {currentPage === 'terms' && <TermsPrivacyPage />}

        {/* Protected User Pages */}
        {currentPage === 'dashboard' && <UserDashboard onNavigate={handleNavigate} />}
        {currentPage === 'my-orders' && <MyOrdersPage onNavigate={handleNavigate} />}
        {currentPage === 'add-funds' && <AddFundsPage onNavigate={handleNavigate} />}
        {currentPage === 'transactions' && <TransactionHistoryPage />}
        {currentPage === 'tickets' && <SupportTicketsPage />}
        {currentPage === 'api-doc' && <ApiDocPage />}
        {currentPage === 'profile' && <ProfilePage />}
      </main>

      {/* Floating WhatsApp Contact Button */}
      <WhatsAppButton />

    </div>
  );
}

export default App;
