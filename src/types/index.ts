export interface User {
  id: string;
  email: string;
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
  originalPrice: number;
  marginPercent?: number;
  customPrice?: number;
  finalPrice: number;
  status: 'active' | 'hidden';
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
  platform: string;
  title?: string;
  url: string;
  icon?: string;
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

export interface ApiProvider {
  id: string;
  name: string;
  url: string;
  apiKey: string;
  apiPassword?: string;
  status: 'active' | 'inactive';
  balance?: number;
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

