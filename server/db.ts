import fs from 'fs';
import path from 'path';

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

interface DBData {
  users: User[];
  categories: ServiceCategory[];
  services: Service[];
  apiProviders: ApiProvider[];
  orders: Order[];
  fundRequests: FundRequest[];
  transactions: Transaction[];
  tickets: SupportTicket[];
  websiteSettings: WebsiteSettings;
  paymentSettings: PaymentSettings;
  socialLinks: SocialLink[];
  announcements: Announcement[];
}

const DB_FILE = path.join(process.cwd(), 'data_db.json');

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
      passwordHash: 'admin123', // Demo plaintext for ease, checked via simple comparison
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
  ]
};

export class Database {
  private data: DBData;

  constructor() {
    this.data = this.load();
  }

  private load(): DBData {
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

    // Ensure tiwarigautam819@gmail.com is present as admin
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

    // Ensure Glory SMM provider is present
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

    this.save(result);
    return result;
  }

  public save(newData?: DBData) {
    if (newData) {
      this.data = newData;
    }
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB_FILE:', err);
    }
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
}

export const db = new Database();
