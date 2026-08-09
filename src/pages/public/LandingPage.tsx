import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Zap,
  Shield,
  Headphones,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Layers,
  Sparkles,
  Users
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { website, socialLinks } = useSettings();
  const brandName = website?.name || 'AG Tech SMM';

  const [totalOrdersCount, setTotalOrdersCount] = useState<number>(() => {
    const saved = localStorage.getItem('ag_total_orders_count');
    const savedTime = localStorage.getItem('ag_total_orders_time');
    const now = Date.now();
    const defaultStart = 1270691;
    if (saved && savedTime) {
      const parsedSaved = parseInt(saved, 10);
      const parsedTime = parseInt(savedTime, 10);
      if (!isNaN(parsedSaved) && !isNaN(parsedTime) && parsedTime <= now) {
        const elapsedSeconds = Math.floor((now - parsedTime) / 1000);
        const added = Math.floor((elapsedSeconds / 30) * 2.5);
        const currentTotal = parsedSaved + added;
        localStorage.setItem('ag_total_orders_count', currentTotal.toString());
        localStorage.setItem('ag_total_orders_time', now.toString());
        return currentTotal;
      }
    }
    localStorage.setItem('ag_total_orders_count', defaultStart.toString());
    localStorage.setItem('ag_total_orders_time', now.toString());
    return defaultStart;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const increment = Math.floor(Math.random() * 2) + 2; // Returns 2 or 3
      setTotalOrdersCount((prev) => {
        const next = prev + increment;
        const now = Date.now();
        localStorage.setItem('ag_total_orders_count', next.toString());
        localStorage.setItem('ag_total_orders_time', now.toString());
        return next;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F6F9]">

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#1e60d5] to-blue-800 text-white pt-12 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6">

          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold border border-white/20">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>#1 Premier SMM Panel Platform 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Accelerate Your Social Presence with <span className="text-amber-300">{brandName}</span>
          </h1>

          <p className="text-sm sm:text-lg text-blue-100 max-w-2xl mx-auto font-medium">
            {website?.description ||
              'High quality, non-drop engagement services for Instagram, YouTube, Telegram, Facebook & TikTok. Instant delivery with 24/7 support.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('register')}
              className="bg-[#28a745] hover:bg-[#218838] text-white font-black px-8 py-3.5 rounded-xl text-sm uppercase tracking-wider shadow-lg transform hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer flex items-center space-x-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('services')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold px-7 py-3.5 rounded-xl text-sm uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer"
            >
              View Services Catalog
            </button>
          </div>

          {/* Experience Stat */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl mx-auto text-center border-t border-white/10 mt-8">
            <div>
              <p className="text-2xl sm:text-3xl font-black">{totalOrdersCount.toLocaleString()}</p>
              <p className="text-xs text-blue-200">Completed Orders</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black">3+ Years</p>
              <p className="text-xs text-blue-200">Market Experience</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-2xl sm:text-3xl font-black">99.9%</p>
              <p className="text-xs text-blue-200">Satisfaction Rate</p>
            </div>
          </div>

        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Why Choose {brandName}?</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Built for influencers, agencies, digital marketers and resellers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
            <div className="w-12 h-12 bg-blue-50 text-[#1e60d5] rounded-xl flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-gray-900">Super Fast Delivery</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Our automated API order processing engine executes orders instantly upon placement.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-gray-900">100% Non-Drop Quality</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Lifetime guarantee refill buttons enabled on premium followers, likes and watch time services.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-gray-900">24/7 Dedicated Support</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Instant assistance through WhatsApp chat and ticket support system anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-white border-y border-gray-200 py-12 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Ready to boost your social media metrics?</h2>
          <p className="text-sm text-gray-600">Create a free account in 30 seconds and start ordering with instant UPI deposits.</p>
          <button
            onClick={() => onNavigate('register')}
            className="bg-[#1e60d5] hover:bg-blue-700 text-white font-extrabold px-8 py-3.5 rounded-xl text-sm uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4 text-xs sm:text-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-gray-800">
          <div className="space-y-2">
            <h3 className="text-white font-black text-lg">{brandName}</h3>
            <p className="text-gray-400 text-xs leading-relaxed">{website?.aboutUs || website?.description}</p>
          </div>

          <div className="space-y-2">
            <p className="text-white font-bold uppercase tracking-wider text-xs">Quick Links</p>
            <div className="flex flex-col space-y-1">
              <button onClick={() => onNavigate('services')} className="hover:text-white text-left">Services Catalog</button>
              <button onClick={() => onNavigate('contact')} className="hover:text-white text-left">Contact Us</button>
              <button onClick={() => onNavigate('terms')} className="hover:text-white text-left">Terms & Conditions</button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-white font-bold uppercase tracking-wider text-xs">Contact Info</p>
            <p>Email: {website?.contactEmail}</p>
            <p>Phone / WhatsApp: {website?.contactPhone}</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 text-center text-xs text-gray-500">
          {website?.footerText || `© 2026 ${brandName}. All Rights Reserved.`}
        </div>
      </footer>

    </div>
  );
};
