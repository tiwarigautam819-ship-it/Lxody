import React, { createContext, useContext, useState, useEffect } from 'react';
import { WebsiteSettings, PaymentSettings, SocialLink, Announcement } from '../types';

interface PricingSettingsType {
  globalMarginPercent: number;
}

interface SettingsContextType {
  website: WebsiteSettings | null;
  payment: PaymentSettings | null;
  pricing: PricingSettingsType | null;
  socialLinks: SocialLink[];
  announcements: Announcement[];
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateWebsite: (data: Partial<WebsiteSettings>) => Promise<void>;
  updatePayment: (data: Partial<PaymentSettings>) => Promise<void>;
  updatePricing: (data: PricingSettingsType) => Promise<void>;
  updateSocialLinks: (links: SocialLink[]) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [website, setWebsite] = useState<WebsiteSettings | null>(null);
  const [payment, setPayment] = useState<PaymentSettings | null>(null);
  const [pricing, setPricing] = useState<PricingSettingsType | null>({ globalMarginPercent: 20 });
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/public/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.website) {
            setWebsite(data.website);
            setPricing({ globalMarginPercent: data.website.globalMarginPercent || 20 });
          }
          if (data.payment) {
            setPayment(data.payment);
          }
          setSocialLinks(data.socialLinks || []);
          setAnnouncements(data.announcements || []);
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateWebsite = async (data: Partial<WebsiteSettings>) => {
    try {
      const token = localStorage.getItem('ag_auth_token');
      const res = await fetch('/api/admin/settings/website', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        await fetchSettings();
      }
    } catch (err) {
      console.error('Failed to update website settings:', err);
    }
  };

  const updatePayment = async (data: Partial<PaymentSettings>) => {
    try {
      const token = localStorage.getItem('ag_auth_token');
      const res = await fetch('/api/admin/settings/payment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        await fetchSettings();
      }
    } catch (err) {
      console.error('Failed to update payment settings:', err);
    }
  };

  const updatePricing = async (data: PricingSettingsType) => {
    try {
      const token = localStorage.getItem('ag_auth_token');
      const res = await fetch('/api/admin/settings/website', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ globalMarginPercent: data.globalMarginPercent })
      });
      if (res.ok) {
        await fetchSettings();
      }
    } catch (err) {
      console.error('Failed to update pricing settings:', err);
    }
  };

  const updateSocialLinks = async (links: SocialLink[]) => {
    try {
      const token = localStorage.getItem('ag_auth_token');
      const res = await fetch('/api/admin/settings/social-links', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ socialLinks: links })
      });
      if (res.ok) {
        await fetchSettings();
      }
    } catch (err) {
      console.error('Failed to update social links:', err);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        website,
        payment,
        pricing,
        socialLinks,
        announcements,
        loading,
        refreshSettings: fetchSettings,
        updateWebsite,
        updatePayment,
        updatePricing,
        updateSocialLinks
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
