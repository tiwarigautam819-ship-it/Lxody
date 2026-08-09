import React, { useState, useEffect } from 'react';
import {
  Layers,
  Wallet,
  Search,
  CheckCircle2,
  Flame,
  ShieldCheck,
  TrendingUp,
  RotateCcw,
  BarChart2,
  ExternalLink,
  Check,
  AlertCircle,
  Video,
  Play,
  HelpCircle,
  Film
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Service, ServiceCategory, TutorialVideo } from '../../types';

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  if (url.includes('youtube.com/embed/')) return url;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (match && match[1]) return `https://www.youtube.com/embed/${match[1]}`;
  return null;
}

function getLinkDetails(categoryName: string = '', serviceName: string = '') {
  const text = (categoryName + ' ' + serviceName).toLowerCase();

  if (text.includes('youtube') || text.includes('yt ') || text.includes('yt_')) {
    return {
      label: 'YouTube Video / Channel Link',
      placeholder: 'e.g., https://www.youtube.com/watch?v=... or Channel Link',
      hint: 'Make sure your YouTube video/channel is Public and embedding is enabled.'
    };
  }

  if (text.includes('telegram') || text.includes('tg ') || text.includes('tg_')) {
    return {
      label: 'Telegram Channel / Group / Post Link',
      placeholder: 'e.g., https://t.me/yourchannel or https://t.me/yourchannel/123',
      hint: 'Make sure your Telegram channel or group is Public.'
    };
  }

  if (text.includes('facebook') || text.includes('fb ') || text.includes('fb_')) {
    return {
      label: 'Facebook Profile / Page / Post Link',
      placeholder: 'e.g., https://www.facebook.com/yourpage or post URL',
      hint: 'Make sure Facebook profile/page/post visibility is set to Public.'
    };
  }

  if (text.includes('twitter') || text.includes('x.com') || text.includes('tweet')) {
    return {
      label: 'Twitter / X Profile or Tweet Link',
      placeholder: 'e.g., https://x.com/username or tweet link',
      hint: 'Make sure Twitter / X profile or tweet is Public.'
    };
  }

  if (text.includes('tiktok')) {
    return {
      label: 'TikTok Video / Profile Link',
      placeholder: 'e.g., https://www.tiktok.com/@username/video/...',
      hint: 'Make sure TikTok video or profile is Public.'
    };
  }

  if (text.includes('spotify')) {
    return {
      label: 'Spotify Track / Artist / Playlist Link',
      placeholder: 'e.g., https://open.spotify.com/track/...',
      hint: 'Provide a valid public Spotify track, playlist, or artist URL.'
    };
  }

  if (text.includes('website') || text.includes('traffic') || text.includes('site')) {
    return {
      label: 'Website URL',
      placeholder: 'e.g., https://yourwebsite.com',
      hint: 'Provide complete website URL starting with https://'
    };
  }

  if (text.includes('instagram') || text.includes('ig ') || text.includes('ig_')) {
    return {
      label: 'Instagram Link or Username',
      placeholder: 'e.g., https://www.instagram.com/p/... or @username',
      hint: 'Account or post must be Public (not private).'
    };
  }

  return {
    label: 'Target Link / Username',
    placeholder: 'e.g., https://link-to-your-post-or-profile',
    hint: 'Target account or link must be Public.'
  };
}

interface UserDashboardProps {
  onNavigate: (page: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate }) => {
  const { user, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'single' | 'mass'>('single');
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [link, setLink] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [agreedTerms, setAgreedTerms] = useState<boolean>(true);

  // Mass Order
  const [massOrderText, setMassOrderText] = useState<string>('');

  // Status & Feedback
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string>('');
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  // Global Total Orders count simulation
  const [totalOrdersCount, setTotalOrdersCount] = useState<number>(1270691);

  // Tutorial Videos
  const [tutorialVideos, setTutorialVideos] = useState<TutorialVideo[]>([]);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories || []);
          setServices(data.services || []);
          if (data.categories.length > 0) {
            setSelectedCategory(data.categories[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTutorialVideos(data.videos || []);
        }
      }
    } catch (err) {
      console.error('Failed to load tutorial videos:', err);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchVideos();
  }, []);

  // Filter services by category and search query
  const categoryServices = services.filter((s) => {
    const matchesCat = !selectedCategory || s.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Auto select first service when category changes
  useEffect(() => {
    if (categoryServices.length > 0) {
      if (!categoryServices.some((s) => s.id === selectedServiceId)) {
        setSelectedServiceId(categoryServices[0].id);
      }
    } else {
      setSelectedServiceId('');
    }
  }, [selectedCategory, searchQuery, services]);

  const activeService = services.find((s) => s.id === selectedServiceId);

  // Calculate charge
  const qtyNumber = parseInt(quantity, 10) || 0;
  const unitRate = activeService ? activeService.finalPrice : 0;
  const totalCharge = activeService && qtyNumber > 0 ? Number(((qtyNumber / 1000) * unitRate).toFixed(2)) : 0;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');
    setOrderSuccess(null);

    if (!activeService) {
      setOrderError('Please select a valid service');
      return;
    }

    if (!link.trim()) {
      setOrderError('Please enter the target link or account username');
      return;
    }

    if (!qtyNumber || qtyNumber < activeService.minQuantity || qtyNumber > activeService.maxQuantity) {
      setOrderError(`Quantity must be between ${activeService.minQuantity.toLocaleString()} and ${activeService.maxQuantity.toLocaleString()}`);
      return;
    }

    if (!agreedTerms) {
      setOrderError('You must agree to the Terms & Conditions before placing an order');
      return;
    }

    if (user && user.walletBalance < totalCharge) {
      setOrderError(`Insufficient wallet balance (Charge: ₹${totalCharge.toFixed(2)}, Available: ₹${user.walletBalance.toFixed(2)}). Please click DEPOSIT NOW to add funds.`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/orders/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}`
        },
        body: JSON.stringify({
          serviceId: activeService.id,
          link: link.trim(),
          quantity: qtyNumber
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setOrderError(data.error || 'Failed to place order');
      } else {
        setOrderSuccess(data);
        setLink('');
        setQuantity('');
        setTotalOrdersCount((prev) => prev + 1);
        await refreshUser();
      }
    } catch (err: any) {
      setOrderError(err.message || 'An unexpected error occurred while placing order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMassOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');
    setOrderSuccess(null);

    const lines = massOrderText.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      setOrderError('Please enter at least one order line in format: service_id|link|quantity');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/orders/mass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}`
        },
        body: JSON.stringify({ massOrders: lines })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setOrderError(data.error || 'Failed to submit mass orders');
      } else {
        setOrderSuccess({ massResults: data.results });
        setMassOrderText('');
        await refreshUser();
      }
    } catch (err: any) {
      setOrderError(err.message || 'Error placing mass order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] pb-20 pt-4 px-3 sm:px-6 w-full max-w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-5 w-full min-w-0">

        {/* ================= CARD 1: TOTAL ORDERS AT AGTECHSMM.COM ================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="w-14 h-14 bg-[#1e60d5] text-white rounded-full mx-auto flex items-center justify-center shadow-md mb-3">
            <Layers className="w-7 h-7" />
          </div>
          <h2 className="text-xs sm:text-sm font-extrabold text-gray-800 tracking-wider uppercase">
            TOTAL ORDERS AT AGTECHSMM.COM
          </h2>
          <div className="text-3xl sm:text-4xl font-black text-gray-900 my-1 tracking-tight">
            {totalOrdersCount.toLocaleString()}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            3+ years experience providing SMM services!
          </p>
        </div>

        {/* ================= CARD 2: DEPOSIT & BALANCE CARD ================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="w-14 h-14 bg-[#1e60d5] text-white rounded-full mx-auto flex items-center justify-center shadow-md mb-3">
            <Wallet className="w-7 h-7" />
          </div>
          <p className="text-xs sm:text-sm text-gray-600 font-medium mb-3">
            looking to Deposit?
          </p>

          <button
            onClick={() => onNavigate('deposit')}
            className="bg-[#28a745] hover:bg-[#218838] text-white font-extrabold text-xs sm:text-sm py-2.5 px-8 rounded-lg uppercase tracking-wider shadow-md active:scale-95 transition-all mb-4"
          >
            DEPOSIT NOW
          </button>

          <div className="pt-2">
            <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase">
              CURRENT BALANCE
            </h3>
            <div className="text-3xl sm:text-4xl font-black text-gray-900 my-1">
              ₹{user ? user.walletBalance.toFixed(2) : '0.00'}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              Your total spendings : <span className="font-bold text-gray-800">₹{user ? user.totalSpent.toFixed(2) : '0.00'}</span>
            </p>
          </div>
        </div>

        {/* ================= CARD 3: ORDER TABS & FORM ================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Tabs Navigation Header */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            <button
              onClick={() => setActiveTab('single')}
              className={`flex-1 py-3.5 px-4 text-center font-bold text-sm sm:text-base flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'single'
                  ? 'bg-white text-[#1e60d5] border-b-2 border-[#1e60d5] shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>New Order</span>
            </button>
            <button
              onClick={() => setActiveTab('mass')}
              className={`flex-1 py-3.5 px-4 text-center font-bold text-sm sm:text-base flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'mass'
                  ? 'bg-white text-[#1e60d5] border-b-2 border-[#1e60d5] shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/60'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Mass Order</span>
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {orderError && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-800 text-sm">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Order Failed</p>
                  <p className="mt-0.5">{orderError}</p>
                </div>
              </div>
            )}

            {orderSuccess && orderSuccess.orderId && (
              <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-emerald-900 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-base text-emerald-800">Order Placed Successfully! 🎉</p>
                  <div className="mt-1 space-y-0.5 text-xs text-emerald-700">
                    <p><span className="font-semibold">Order ID:</span> #{orderSuccess.orderId}</p>
                    <p><span className="font-semibold">Total Charge:</span> ₹{orderSuccess.charge.toFixed(2)}</p>
                    <p><span className="font-semibold">Remaining Balance:</span> ₹{orderSuccess.remainingBalance.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => onNavigate('orders')}
                    className="mt-2 text-xs font-bold text-emerald-800 underline hover:text-emerald-900 flex items-center space-x-1"
                  >
                    <span>View in My Orders</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'single' ? (
              <form onSubmit={handlePlaceOrder} className="space-y-4">

                {/* Search Service Input */}
                <div>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search Service"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-50/80 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e60d5] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Category Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e60d5] focus:bg-white transition-all cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Service <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e60d5] focus:bg-white transition-all cursor-pointer"
                  >
                    {categoryServices.length === 0 ? (
                      <option value="">No services available for this selection</option>
                    ) : (
                      categoryServices.map((srv) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name} — ₹{srv.finalPrice.toFixed(2)} per 1,000
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Service Description Box (Matching Screenshot 2!) */}
                {activeService && (
                  <div className="bg-gray-50/90 border border-gray-200/80 rounded-xl p-4 text-xs sm:text-sm text-gray-700 space-y-2 leading-relaxed">
                    <div className="font-bold text-gray-900 border-b border-gray-200 pb-1.5 mb-2 flex items-center justify-between">
                      <span>Service Info</span>
                      <span className="text-xs text-[#1e60d5] font-extrabold bg-blue-50 px-2 py-0.5 rounded-md">
                        ₹{activeService.finalPrice.toFixed(2)} / 1K
                      </span>
                    </div>

                    <div className="space-y-1.5 whitespace-pre-line font-medium text-gray-700">
                      {activeService.description || (
                        <ul className="space-y-1">
                          <li className="flex items-center space-x-2">
                            <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Refill: Lifetime Guarantee (Automatic Refill if Drop)</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-rose-500 shrink-0" />
                            <span>Max Order: Up to {activeService.maxQuantity.toLocaleString()} per Order</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <BarChart2 className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>Boost your post engagement & increase visibility</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Helps in better reach, trust & organic growth</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>100% Safe Service</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>Perfect for creators, influencers & resellers</span>
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {/* Link Field */}
                {(() => {
                  const selectedCategoryObj = categories.find((c) => c.id === selectedCategory);
                  const linkDetails = getLinkDetails(selectedCategoryObj?.name || activeService?.categoryName || '', activeService?.name || '');
                  return (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                        <span>{linkDetails.label} <span className="text-red-500">*</span></span>
                        {activeService && (
                          <span className="text-[11px] text-[#1e60d5] font-semibold lowercase">
                            {selectedCategoryObj?.name || activeService.categoryName}
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        placeholder={linkDetails.placeholder}
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e60d5] focus:bg-white transition-all font-medium"
                        required
                      />
                      <p className="text-[11px] text-gray-500 mt-1 font-medium">
                        {linkDetails.hint}
                      </p>
                    </div>
                  );
                })()}

                {/* Quantity Field */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder={`Min: ${activeService?.minQuantity || 10} - Max: ${activeService?.maxQuantity || 10000}`}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e60d5] focus:bg-white transition-all"
                    min={activeService?.minQuantity || 1}
                    max={activeService?.maxQuantity || 1000000}
                    required
                  />
                  {activeService && (
                    <p className="text-[11px] text-gray-500 mt-1 font-medium">
                      Min: {activeService.minQuantity.toLocaleString()} - Max: {activeService.maxQuantity.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Total Charge Field */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Total Charge
                  </label>
                  <div className="w-full bg-gray-100/90 border border-gray-200 rounded-lg px-3.5 py-2.5 text-base font-extrabold text-gray-900">
                    ₹{totalCharge.toFixed(2)}
                  </div>
                </div>

                {/* Terms & Conditions Checkbox */}
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="termsCheck"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="w-4 h-4 text-[#1e60d5] rounded-xs border-gray-300 focus:ring-[#1e60d5]"
                  />
                  <label htmlFor="termsCheck" className="text-xs sm:text-sm text-gray-700 font-medium">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('terms')}
                      className="text-[#1e60d5] font-bold underline hover:text-blue-800"
                    >
                      Terms & Conditions
                    </button>
                  </label>
                </div>

                {/* PLACE ORDER BUTTON */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1e60d5] hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-lg text-sm sm:text-base tracking-wider uppercase shadow-md active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? 'PROCESSING ORDER...' : 'PLACE ORDER'}
                </button>
              </form>
            ) : (
              /* Mass Order Tab */
              <form onSubmit={handleMassOrderSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    One order per line in format: service_id | link | quantity
                  </label>
                  <textarea
                    rows={8}
                    placeholder={`Example:\nsrv_1 | https://www.instagram.com/p/C3xX91yO2z/ | 1000\nsrv_2 | https://www.instagram.com/reel/XYZ123 | 5000`}
                    value={massOrderText}
                    onChange={(e) => setMassOrderText(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs sm:text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e60d5] focus:bg-white transition-all"
                  />
                </div>

                <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-xs text-blue-900 leading-relaxed">
                  <p className="font-bold mb-1">Mass Order Instructions:</p>
                  <p>1. Get the Service ID from the Services catalog page.</p>
                  <p>2. Format: <code className="bg-white px-1.5 py-0.5 rounded-xs border border-blue-200 font-mono text-blue-800">service_id | link | quantity</code></p>
                  <p>3. Submit multiple orders simultaneously.</p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1e60d5] hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-lg text-sm sm:text-base tracking-wider uppercase shadow-md active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'SUBMITTING MASS ORDERS...' : 'SUBMIT MASS ORDERS'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ================= CARD 4: TUTORIAL & GUIDE VIDEOS ================= */}
        {tutorialVideos.filter((v) => v.active).length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-5 sm:p-6 space-y-4">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center space-x-2">
                  <span>How to Place Orders & Video Guides</span>
                  <span className="bg-red-50 text-red-600 text-[10px] uppercase font-black px-2 py-0.5 rounded-full border border-red-100">
                    Tutorials
                  </span>
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Watch official video guides to learn how to place orders and manage your account.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {tutorialVideos
                .filter((v) => v.active)
                .map((video) => {
                  const embedUrl = getYouTubeEmbedUrl(video.videoUrl);
                  return (
                    <div
                      key={video.id}
                      className="bg-gray-50/80 rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col"
                    >
                      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                        {embedUrl ? (
                          <iframe
                            src={embedUrl}
                            title={video.title}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full h-full flex flex-col items-center justify-center text-white hover:bg-slate-800 transition-colors p-4 text-center"
                          >
                            <Play className="w-12 h-12 text-red-500 mb-2 fill-current" />
                            <span className="font-bold text-xs underline">Watch Tutorial Video</span>
                          </a>
                        )}

                        <span className="absolute top-2.5 left-2.5 bg-slate-900/90 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border border-slate-700">
                          {video.category || 'Guide'}
                        </span>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-2 bg-white">
                        <div>
                          <h4 className="font-bold text-gray-900 text-xs sm:text-sm leading-snug">
                            {video.title}
                          </h4>
                          {video.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                              {video.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 flex items-center justify-between text-[11px] border-t border-gray-100">
                          <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1e60d5] font-extrabold hover:underline flex items-center space-x-1"
                          >
                            <span>Open on YouTube</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <span className="text-gray-400 font-medium text-[10px]">AG TECH SMM</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
