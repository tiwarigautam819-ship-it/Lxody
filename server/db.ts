import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'user';
  walletBalance: number;
  totalSpent: number;
  status: 'active' | 'blocked';
  createdAt: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon?: string;
  sortOrder: number;
}

export interface Service {
  id: string;
  categoryId: string;
  categoryName: string;
  apiProviderId?: string;
  apiServiceId?: string;
  name: string;
  description: string;
  minQuantity: number;
  maxQuantity: number;
  originalPrice: number; // Provider cost per 1000
  marginPercent?: number; // Specific margin %
  customPrice?: number; // Custom selling price per 1000
  finalPrice: number; // Computed selling price per 1000
  status: 'active' | 'hidden';
}

export interface ApiProvider {
  id: string;
  name: string;
  url: string;
  apiKey: string;
  apiPassword?: string;
  status: 'active' | 'inactive';
  balance?: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  serviceId: string;
  serviceName: string;
  categoryName: string;
  link: string;
  quantity: number;
  charge: number;
  status: 'Pending' | 'Processing' | 'In Progress' | 'Completed' | 'Partial' | 'Canceled' | 'Failed';
  providerOrderId?: string;
  startCount: number;
  remains: number;
  createdAt: string;
}

export interface FundRequest {
  id: string;
  userId: string;
  userEmail: string;
  username: string;
  amount: number;
  utrNumber: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminNote?: string;
  createdAt: string;
  processedAt?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  type: 'Deposit' | 'Order Charge' | 'Refund' | 'Admin Adjustment';
  amount: number;
  status: 'Success' | 'Failed' | 'Pending';
  description: string;
  utrNumber?: string;
  createdAt: string;
}

export interface TicketMessage {
  id: string;
  sender: 'user' | 'admin';
  senderName: string;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  status: 'Open' | 'Answered' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteSettings {
  name: string;
  logoUrl: string;
  faviconUrl: string;
  description: string;
  aboutUs: string;
  contactEmail: string;
  contactPhone: string;
  noticeText: string;
  footerText: string;
  globalMarginPercent: number;
}

export interface PaymentSettings {
  upiId: string;
  qrCodeUrl: string;
  instructions: string;
  minDeposit: number;
  maxDeposit: number;
  isEnabled: boolean;
}

export interface SocialLink {
  id: string;
  platform: 'Instagram' | 'Telegram' | 'WhatsApp' | 'YouTube' | 'Facebook' | 'Twitter' | 'Email';
  url: string;
  icon: string;
  enabled: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
  active: boolean;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  userEmail: string;
  type: 'order_status_change' | 'ticket_reply' | 'system';
  title: string;
  message: string;
  link?: string;
  emailSent?: boolean;
  read: boolean;
  createdAt: string;
}

export interface TutorialVideo {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  category?: string;
  active: boolean;
  createdAt: string;
}

interface DBData {
  users: User[];
  categories: ServiceCategory[];
  services: Service[];
  apiProviders: ApiProvider[];
  orders: Order[];
  fundRequests: FundRequest[];
  transactions: Transaction[];
  tickets: SupportTicket[];
  notifications: AppNotification[];
  tutorialVideos: TutorialVideo[];
  websiteSettings: WebsiteSettings;
  paymentSettings: PaymentSettings;
  socialLinks: SocialLink[];
  announcements: Announcement[];
}

const DB_FILE = path.join(process.cwd(), 'data_db.json');

// Initialize Firestore DB connection if firebase-applet-config exists
let firestoreDb: ReturnType<typeof getFirestore> | null = null;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const app = getApps().length > 0 ? getApp() : initializeApp(config);
    const dbId = config.firestoreDatabaseId || '(default)';
    firestoreDb = getFirestore(app, dbId);
    console.log(`[Firestore] Initialized Firestore successfully (${dbId})`);
  }
} catch (err) {
  console.error('[Firestore] Initialization error:', err);
}

const defaultData: DBData = {
  users: [
    {
      id: 'admin_tiwari',
      email: 'tiwarigautam819@gmail.com',
      passwordHash: 'admin123',
      name: 'Gautam Tiwari (Admin)',
      role: 'admin',
      walletBalance: 100000,
      totalSpent: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'admin_1',
      email: 'admin@agtechsmm.com',
      passwordHash: 'admin123',
      name: 'AG Tech Admin',
      role: 'admin',
      walletBalance: 10000,
      totalSpent: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'user_1',
      email: 'user@agtechsmm.com',
      passwordHash: 'user123',
      name: 'Demo Customer',
      role: 'user',
      walletBalance: 500,
      totalSpent: 120,
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ],
  categories: [
    { id: 'cat_1', name: '🔥 Instagram Likes & Reels', sortOrder: 1 },
    { id: 'cat_2', name: '👥 Instagram Followers [Real & Active]', sortOrder: 2 },
    { id: 'cat_3', name: '🎥 YouTube Views & Watch Time', sortOrder: 3 },
    { id: 'cat_4', name: '✈️ Telegram Members & Post Views', sortOrder: 4 },
    { id: 'cat_5', name: '👍 Facebook Page Likes & Followers', sortOrder: 5 }
  ],
  services: [
    {
      id: 'srv_1',
      categoryId: 'cat_1',
      categoryName: '🔥 Instagram Likes & Reels',
      name: 'Instagram Likes [ Working / High Speed / Non-Drop ] ⚡',
      description: `♻️ Refill: Lifetime Guarantee (Automatic Refill if Drop)\n📈 Max Order: Up to 10,000 Likes per Order\n📊 Boost your post engagement & increase visibility\n🔥 Helps in better reach, trust & organic growth\n🔒 100% Safe Service\n✅ Perfect for creators, influencers & resellers`,
      minQuantity: 10,
      maxQuantity: 100000,
      originalPrice: 15,
      marginPercent: 20,
      finalPrice: 18,
      status: 'active'
    },
    {
      id: 'srv_2',
      categoryId: 'cat_1',
      categoryName: '🔥 Instagram Likes & Reels',
      name: 'Instagram Reels Views [ Instant / Super Fast ] 🚀',
      description: `⚡ Start Time: Instant (0-5 mins)\n♻️ Refill: Non-Drop Guarantee\n🎯 Account Must be Public!`,
      minQuantity: 100,
      maxQuantity: 1000000,
      originalPrice: 2.5,
      marginPercent: 20,
      finalPrice: 3,
      status: 'active'
    },
    {
      id: 'srv_3',
      categoryId: 'cat_2',
      categoryName: '👥 Instagram Followers [Real & Active]',
      name: 'Instagram Followers [ Real Accounts / 30 Days Refill ] 👥',
      description: `⚡ Speed: 5,000 per day\n♻️ 30 Days Refill Button Enabled\n🔒 Safe & Non-Drop Quality`,
      minQuantity: 50,
      maxQuantity: 50000,
      originalPrice: 80,
      marginPercent: 25,
      finalPrice: 100,
      status: 'active'
    },
    {
      id: 'srv_4',
      categoryId: 'cat_3',
      categoryName: '🎥 YouTube Views & Watch Time',
      name: 'YouTube High Retention Views [ Non-Drop / Monetizable ] 📹',
      description: `⏱️ Watch Time: 2-5 Minutes per View\n🌍 Location: Worldwide Real Users\n✅ Safe for Channel Monetization`,
      minQuantity: 500,
      maxQuantity: 100000,
      originalPrice: 150,
      marginPercent: 20,
      finalPrice: 180,
      status: 'active'
    },
    {
      id: 'srv_5',
      categoryId: 'cat_4',
      categoryName: '✈️ Telegram Members & Post Views',
      name: 'Telegram Channel/Group Members [ Non-Drop / Instant ] ✈️',
      description: `⚡ Instant Start\n♻️ Lifetime Guarantee\n🎯 Supports Public Channels & Groups`,
      minQuantity: 100,
      maxQuantity: 25000,
      originalPrice: 40,
      marginPercent: 20,
      finalPrice: 48,
      status: 'active'
    }
  ],
  apiProviders: [
    {
      id: 'provider_glory',
      name: 'Glory SMM Panel',
      url: 'https://glorysmmpanel.com/api/v2',
      apiKey: '6379013f076f1337035c019bd9fda0c5c7e7297b',
      status: 'active',
      balance: 10000
    },
    {
      id: 'provider_1',
      name: 'Global SMM Provider v1',
      url: 'https://api.globalsmmpanel.com/v2',
      apiKey: 'demo_api_key_agtech_98765',
      status: 'active',
      balance: 15420.50
    }
  ],
  orders: [
    {
      id: '10001',
      userId: 'user_1',
      userEmail: 'user@agtechsmm.com',
      serviceId: 'srv_1',
      serviceName: 'Instagram Likes [ Working / High Speed / Non-Drop ] ⚡',
      categoryName: '🔥 Instagram Likes & Reels',
      link: 'https://www.instagram.com/p/C3xX91yO2z/',
      quantity: 1000,
      charge: 18,
      status: 'Completed',
      providerOrderId: 'PROV_88291',
      startCount: 450,
      remains: 0,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ],
  fundRequests: [],
  transactions: [
    {
      id: 'TXN_1001',
      userId: 'user_1',
      userEmail: 'user@agtechsmm.com',
      type: 'Deposit',
      amount: 500,
      status: 'Success',
      description: 'Deposit approved via UPI UTR 420918239012',
      utrNumber: '420918239012',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ],
  tickets: [],
  websiteSettings: {
    name: 'AG Tech SMM',
    logoUrl: '',
    faviconUrl: '',
    description: 'Best & Cheapest Social Media Marketing Panel for Instagram, YouTube, Telegram, Facebook and TikTok. Fast automated order processing with 24/7 support.',
    aboutUs: 'AG Tech SMM is the leading Social Media Services Provider offering high speed, non-drop engagement solutions for influencers, content creators, digital agencies, and resellers worldwide.',
    contactEmail: 'support@agtechsmm.com',
    contactPhone: '+91 98765 43210',
    noticeText: '⚡ Fast Processing Enabled! All Instagram Likes & Followers working smooth.',
    footerText: '© 2026 AG Tech SMM. All Rights Reserved. Premier SMM Panel Services.',
    globalMarginPercent: 20
  },
  paymentSettings: {
    upiId: 'agtechsmm@upi',
    qrCodeUrl: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=400&q=80',
    instructions: '1. Scan the QR Code using any UPI App (GPay, PhonePe, Paytm, BHIM).\n2. Pay your desired deposit amount.\n3. Copy the 12-digit UTR / Transaction ID.\n4. Enter the Amount and UTR Number below and click Submit Request.',
    minDeposit: 10,
    maxDeposit: 50000,
    isEnabled: true
  },
  socialLinks: [
    { id: 'soc_1', platform: 'Telegram', url: 'https://t.me/agtechsmm', icon: 'send', enabled: true },
    { id: 'soc_2', platform: 'WhatsApp', url: 'https://wa.me/919876543210?text=Hello%20AG%20Tech%20SMM%20Support', icon: 'message-circle', enabled: true },
    { id: 'soc_3', platform: 'Instagram', url: 'https://instagram.com/agtechsmm', icon: 'instagram', enabled: true },
    { id: 'soc_4', platform: 'YouTube', url: 'https://youtube.com/@agtechsmm', icon: 'youtube', enabled: true }
  ],
  announcements: [
    {
      id: 'ann_1',
      title: '🚀 Service Update',
      content: 'Instagram Likes & YouTube Watch Time services are updated with Instant Start & Non-Drop Refill Guarantee!',
      type: 'info',
      active: true,
      createdAt: new Date().toISOString()
    }
  ],
  notifications: [],
  tutorialVideos: [
    {
      id: 'VID_1',
      title: 'How to Place a New Order on AG TECH SMM Panel',
      description: 'Watch step-by-step how to select service, paste your target link, enter quantity, and place instant orders.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      category: 'New Order Guide',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'VID_2',
      title: 'How to Add Funds using PhonePe / Paytm / UPI QR Code',
      description: 'Step by step guide to scan UPI QR code, pay funds, copy 12-digit UTR and add instant balance.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      category: 'Add Funds Guide',
      active: true,
      createdAt: new Date().toISOString()
    }
  ]
};

export class Database {
  private data: DBData;

  constructor() {
    this.data = this.loadLocal();
    this.syncWithFirestore();
  }

  private loadLocal(): DBData {
    let result = defaultData;
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        result = { ...defaultData, ...parsed };
      }
    } catch (err) {
      console.error('Error reading DB_FILE, fallback to default:', err);
    }
    return this.ensureDefaults(result);
  }

  private ensureDefaults(result: DBData): DBData {
    if (!result.notifications) result.notifications = [];
    if (!result.tutorialVideos) result.tutorialVideos = defaultData.tutorialVideos;

    const tiwariEmail = 'tiwarigautam819@gmail.com';
    let tiwariUser = result.users.find(u => u.email.toLowerCase() === tiwariEmail.toLowerCase());
    if (!tiwariUser) {
      result.users.push({
        id: 'admin_tiwari',
        email: tiwariEmail,
        passwordHash: 'admin123',
        name: 'Gautam Tiwari (Admin)',
        role: 'admin',
        walletBalance: 100000,
        totalSpent: 0,
        status: 'active',
        createdAt: new Date().toISOString()
      });
    } else if (tiwariUser.role !== 'admin') {
      tiwariUser.role = 'admin';
    }

    const gloryUrl = 'https://glorysmmpanel.com/api/v2';
    const gloryProvider = result.apiProviders.find(p => p.url === gloryUrl);
    if (!gloryProvider) {
      result.apiProviders.unshift({
        id: 'provider_glory',
        name: 'Glory SMM Panel',
        url: gloryUrl,
        apiKey: '6379013f076f1337035c019bd9fda0c5c7e7297b',
        status: 'active',
        balance: 10000
      });
    }

    // Sanitize websiteSettings to avoid document size bloat
    const ws = result.websiteSettings || defaultData.websiteSettings;
    result.websiteSettings = {
      name: ws.name || defaultData.websiteSettings.name,
      logoUrl: ws.logoUrl || defaultData.websiteSettings.logoUrl,
      faviconUrl: ws.faviconUrl || defaultData.websiteSettings.faviconUrl,
      description: ws.description || defaultData.websiteSettings.description,
      aboutUs: ws.aboutUs || defaultData.websiteSettings.aboutUs,
      contactEmail: ws.contactEmail || defaultData.websiteSettings.contactEmail,
      contactPhone: ws.contactPhone || defaultData.websiteSettings.contactPhone,
      noticeText: ws.noticeText || defaultData.websiteSettings.noticeText,
      footerText: ws.footerText || defaultData.websiteSettings.footerText,
      globalMarginPercent: ws.globalMarginPercent !== undefined ? ws.globalMarginPercent : defaultData.websiteSettings.globalMarginPercent,
    };

    // Sanitize paymentSettings
    const ps = result.paymentSettings || defaultData.paymentSettings;
    result.paymentSettings = {
      upiId: ps.upiId || defaultData.paymentSettings.upiId,
      qrCodeUrl: ps.qrCodeUrl || defaultData.paymentSettings.qrCodeUrl,
      instructions: ps.instructions || defaultData.paymentSettings.instructions,
      minDeposit: ps.minDeposit !== undefined ? ps.minDeposit : defaultData.paymentSettings.minDeposit,
      maxDeposit: ps.maxDeposit !== undefined ? ps.maxDeposit : defaultData.paymentSettings.maxDeposit,
      isEnabled: ps.isEnabled !== undefined ? ps.isEnabled : defaultData.paymentSettings.isEnabled,
    };

    return result;
  }

  private async syncWithFirestore() {
    if (!firestoreDb) return;
    try {
      console.log('[Firestore] Checking remote data sync...');
      const collections = [
        'users', 'categories', 'apiProviders', 'orders',
        'fundRequests', 'transactions', 'tickets', 'notifications', 'tutorialVideos',
        'websiteSettings', 'paymentSettings', 'socialLinks', 'announcements'
      ];

      let hasRemoteData = false;
      const fetchedData: Partial<DBData> = {};

      for (const key of collections) {
        try {
          const docRef = doc(firestoreDb, 'smm_panel', key);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            hasRemoteData = true;
            const data = snap.data();
            if (key === 'websiteSettings') {
              fetchedData.websiteSettings = {
                name: data.name || defaultData.websiteSettings.name,
                logoUrl: data.logoUrl || defaultData.websiteSettings.logoUrl,
                faviconUrl: data.faviconUrl || defaultData.websiteSettings.faviconUrl,
                description: data.description || defaultData.websiteSettings.description,
                aboutUs: data.aboutUs || defaultData.websiteSettings.aboutUs,
                contactEmail: data.contactEmail || defaultData.websiteSettings.contactEmail,
                contactPhone: data.contactPhone || defaultData.websiteSettings.contactPhone,
                noticeText: data.noticeText || defaultData.websiteSettings.noticeText,
                footerText: data.footerText || defaultData.websiteSettings.footerText,
                globalMarginPercent: data.globalMarginPercent !== undefined ? data.globalMarginPercent : defaultData.websiteSettings.globalMarginPercent,
              };
            } else if (key === 'paymentSettings') {
              fetchedData.paymentSettings = {
                upiId: data.upiId || defaultData.paymentSettings.upiId,
                qrCodeUrl: data.qrCodeUrl || defaultData.paymentSettings.qrCodeUrl,
                instructions: data.instructions || defaultData.paymentSettings.instructions,
                minDeposit: data.minDeposit !== undefined ? data.minDeposit : defaultData.paymentSettings.minDeposit,
                maxDeposit: data.maxDeposit !== undefined ? data.maxDeposit : defaultData.paymentSettings.maxDeposit,
                isEnabled: data.isEnabled !== undefined ? data.isEnabled : defaultData.paymentSettings.isEnabled,
              };
            } else if (data && data[key]) {
              (fetchedData as any)[key] = data[key];
            }
          }
        } catch (e) {
          console.error(`[Firestore] Error fetching key ${key}:`, e);
        }
      }

      // Fetch services chunks
      const fetchedServices: Service[] = [];
      let chunkIdx = 0;
      while (chunkIdx < 30) { // Max 30 chunks = 7,500 services
        try {
          const docRef = doc(firestoreDb, 'smm_panel', `services_chunk_${chunkIdx}`);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            hasRemoteData = true;
            const data = snap.data();
            if (data && Array.isArray(data.services)) {
              fetchedServices.push(...data.services);
            }
          } else {
            break;
          }
        } catch (e) {
          break;
        }
        chunkIdx++;
      }

      if (fetchedServices.length > 0) {
        fetchedData.services = fetchedServices;
      }

      if (hasRemoteData) {
        const mergedUsers = (fetchedData.users && fetchedData.users.length > 0) ? fetchedData.users : this.data.users;
        const mergedCategories = (fetchedData.categories && fetchedData.categories.length > 0) ? fetchedData.categories : this.data.categories;
        const mergedServices = (fetchedData.services && fetchedData.services.length >= this.data.services.length) ? fetchedData.services : this.data.services;
        const mergedApiProviders = (fetchedData.apiProviders && fetchedData.apiProviders.length > 0) ? fetchedData.apiProviders : this.data.apiProviders;
        const mergedOrders = (fetchedData.orders && fetchedData.orders.length > 0) ? fetchedData.orders : this.data.orders;
        const mergedFundRequests = (fetchedData.fundRequests && fetchedData.fundRequests.length > 0) ? fetchedData.fundRequests : this.data.fundRequests;
        const mergedTransactions = (fetchedData.transactions && fetchedData.transactions.length > 0) ? fetchedData.transactions : this.data.transactions;
        const mergedTickets = (fetchedData.tickets && fetchedData.tickets.length > 0) ? fetchedData.tickets : this.data.tickets;
        const mergedNotifications = (fetchedData.notifications && fetchedData.notifications.length > 0) ? fetchedData.notifications : this.data.notifications;
        const mergedVideos = (fetchedData.tutorialVideos && fetchedData.tutorialVideos.length > 0) ? fetchedData.tutorialVideos : this.data.tutorialVideos;
        const mergedWebsite = fetchedData.websiteSettings || this.data.websiteSettings;
        const mergedPayment = fetchedData.paymentSettings || this.data.paymentSettings;
        const mergedSocial = fetchedData.socialLinks || this.data.socialLinks;
        const mergedAnnounce = fetchedData.announcements || this.data.announcements;

        this.data = this.ensureDefaults({
          users: mergedUsers,
          categories: mergedCategories,
          services: mergedServices,
          apiProviders: mergedApiProviders,
          orders: mergedOrders,
          fundRequests: mergedFundRequests,
          transactions: mergedTransactions,
          tickets: mergedTickets,
          notifications: mergedNotifications,
          tutorialVideos: mergedVideos,
          websiteSettings: mergedWebsite,
          paymentSettings: mergedPayment,
          socialLinks: mergedSocial,
          announcements: mergedAnnounce
        });
        this.saveLocal();
        console.log(`[Firestore] Synced with Firestore! Loaded ${this.data.services.length} services, ${this.data.users.length} users.`);
      }

      // Sync back to Firestore in chunked mode
      this.saveToFirestore();
    } catch (err) {
      console.error('[Firestore] Sync error:', err);
    }
  }

  private async saveToFirestore() {
    if (!firestoreDb) return;
    try {
      const dbObj = JSON.parse(JSON.stringify(this.data));

      const keys = [
        'users', 'categories', 'apiProviders', 'orders',
        'fundRequests', 'transactions', 'tickets', 'notifications', 'tutorialVideos',
        'websiteSettings', 'paymentSettings', 'socialLinks', 'announcements'
      ];

      for (const key of keys) {
        const docRef = doc(firestoreDb, 'smm_panel', key);
        if (key === 'websiteSettings') {
          const ws = dbObj.websiteSettings || {};
          let safeLogo = ws.logoUrl || '';
          if (safeLogo.length > 200000) safeLogo = '';
          let safeFav = ws.faviconUrl || '';
          if (safeFav.length > 200000) safeFav = '';

          const cleanWS = {
            name: ws.name || '',
            logoUrl: safeLogo,
            faviconUrl: safeFav,
            description: ws.description || '',
            aboutUs: ws.aboutUs || '',
            contactEmail: ws.contactEmail || '',
            contactPhone: ws.contactPhone || '',
            noticeText: ws.noticeText || '',
            footerText: ws.footerText || '',
            globalMarginPercent: ws.globalMarginPercent !== undefined ? ws.globalMarginPercent : 20,
          };
          await setDoc(docRef, cleanWS);
        } else if (key === 'paymentSettings') {
          const ps = dbObj.paymentSettings || {};
          let safeQr = ps.qrCodeUrl || '';
          if (safeQr.length > 200000) safeQr = '';

          const cleanPS = {
            upiId: ps.upiId || '',
            qrCodeUrl: safeQr,
            instructions: ps.instructions || '',
            minDeposit: ps.minDeposit || 10,
            maxDeposit: ps.maxDeposit || 100000,
            isEnabled: ps.isEnabled !== undefined ? ps.isEnabled : true,
          };
          await setDoc(docRef, cleanPS);
        } else {
          await setDoc(docRef, { [key]: dbObj[key] || [] });
        }
      }

      // Save services in chunks of 250
      const services = dbObj.services || [];
      const CHUNK_SIZE = 250;
      let chunkIdx = 0;
      for (let i = 0; i < services.length; i += CHUNK_SIZE) {
        const chunk = services.slice(i, i + CHUNK_SIZE);
        const docRef = doc(firestoreDb, 'smm_panel', `services_chunk_${chunkIdx}`);
        await setDoc(docRef, { services: chunk });
        chunkIdx++;
      }
      console.log(`[Firestore] Saved data to Firestore successfully (${chunkIdx} service chunks)`);
    } catch (err) {
      console.error('[Firestore] Save error:', err);
    }
  }

  private saveLocal() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB_FILE:', err);
    }
  }

  public save(newData?: DBData) {
    if (newData) {
      this.data = newData;
    }
    this.saveLocal();
    this.saveToFirestore();
  }

  // Helper getters and mutators
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public addUser(user: User) {
    this.data.users.push(user);
    this.save();
  }

  public updateUser(id: string, updates: Partial<User>) {
    const userIndex = this.data.users.findIndex((u) => u.id === id);
    if (userIndex !== -1) {
      this.data.users[userIndex] = { ...this.data.users[userIndex], ...updates };
      this.save();
    }
  }

  public getCategories(): ServiceCategory[] {
    return this.data.categories.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public setCategories(categories: ServiceCategory[]) {
    this.data.categories = categories;
    this.save();
  }

  public getServices(): Service[] {
    return this.data.services;
  }

  public getServiceById(id: string): Service | undefined {
    return this.data.services.find((s) => s.id === id);
  }

  public setServices(services: Service[]) {
    this.data.services = services;
    this.save();
  }

  public addService(service: Service) {
    this.data.services.push(service);
    this.save();
  }

  public updateService(id: string, updates: Partial<Service>) {
    const index = this.data.services.findIndex((s) => s.id === id);
    if (index !== -1) {
      this.data.services[index] = { ...this.data.services[index], ...updates };
      this.save();
    }
  }

  public deleteService(id: string) {
    this.data.services = this.data.services.filter((s) => s.id !== id);
    this.save();
  }

  public getApiProviders(): ApiProvider[] {
    return this.data.apiProviders;
  }

  public setApiProviders(providers: ApiProvider[]) {
    this.data.apiProviders = providers;
    this.save();
  }

  public getOrders(): Order[] {
    return this.data.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addOrder(order: Order) {
    this.data.orders.unshift(order);
    this.save();
  }

  public updateOrder(id: string, updates: Partial<Order>) {
    const index = this.data.orders.findIndex((o) => o.id === id);
    if (index !== -1) {
      this.data.orders[index] = { ...this.data.orders[index], ...updates };
      this.save();
    }
  }

  public getFundRequests(): FundRequest[] {
    return this.data.fundRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addFundRequest(req: FundRequest) {
    this.data.fundRequests.unshift(req);
    this.save();
  }

  public updateFundRequest(id: string, updates: Partial<FundRequest>) {
    const index = this.data.fundRequests.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.data.fundRequests[index] = { ...this.data.fundRequests[index], ...updates };
      this.save();
    }
  }

  public getTransactions(): Transaction[] {
    return this.data.transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addTransaction(tx: Transaction) {
    this.data.transactions.unshift(tx);
    this.save();
  }

  public getTickets(): SupportTicket[] {
    return this.data.tickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public addTicket(ticket: SupportTicket) {
    this.data.tickets.unshift(ticket);
    this.save();
  }

  public updateTicket(id: string, updates: Partial<SupportTicket>) {
    const index = this.data.tickets.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.data.tickets[index] = { ...this.data.tickets[index], ...updates };
      this.save();
    }
  }

  public getWebsiteSettings(): WebsiteSettings {
    return this.data.websiteSettings;
  }

  public updateWebsiteSettings(settings: Partial<WebsiteSettings>) {
    this.data.websiteSettings = { ...this.data.websiteSettings, ...settings };
    this.save();
  }

  public getPaymentSettings(): PaymentSettings {
    return this.data.paymentSettings;
  }

  public updatePaymentSettings(settings: Partial<PaymentSettings>) {
    this.data.paymentSettings = { ...this.data.paymentSettings, ...settings };
    this.save();
  }

  public getSocialLinks(): SocialLink[] {
    return this.data.socialLinks;
  }

  public setSocialLinks(links: SocialLink[]) {
    this.data.socialLinks = links;
    this.save();
  }

  public getAnnouncements(): Announcement[] {
    return this.data.announcements;
  }

  public setAnnouncements(announcements: Announcement[]) {
    this.data.announcements = announcements;
    this.save();
  }

  public getNotifications(userId?: string): AppNotification[] {
    const list = this.data.notifications || [];
    if (!userId) return list;
    return list.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addNotification(notification: AppNotification) {
    if (!this.data.notifications) this.data.notifications = [];
    this.data.notifications.unshift(notification);
    this.save();
  }

  public markNotificationRead(id: string, userId: string) {
    if (!this.data.notifications) return;
    const notif = this.data.notifications.find((n) => n.id === id && n.userId === userId);
    if (notif) {
      notif.read = true;
      this.save();
    }
  }

  public markAllNotificationsRead(userId: string) {
    if (!this.data.notifications) return;
    this.data.notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    this.save();
  }

  public getTutorialVideos(activeOnly = false): TutorialVideo[] {
    const list = this.data.tutorialVideos || [];
    if (activeOnly) {
      return list.filter((v) => v.active);
    }
    return list;
  }

  public addTutorialVideo(video: TutorialVideo) {
    if (!this.data.tutorialVideos) this.data.tutorialVideos = [];
    this.data.tutorialVideos.unshift(video);
    this.save();
  }

  public updateTutorialVideo(id: string, updates: Partial<TutorialVideo>) {
    if (!this.data.tutorialVideos) return;
    const index = this.data.tutorialVideos.findIndex((v) => v.id === id);
    if (index !== -1) {
      this.data.tutorialVideos[index] = { ...this.data.tutorialVideos[index], ...updates };
      this.save();
    }
  }

  public deleteTutorialVideo(id: string) {
    if (!this.data.tutorialVideos) return;
    this.data.tutorialVideos = this.data.tutorialVideos.filter((v) => v.id !== id);
    this.save();
  }
}

export const db = new Database();
