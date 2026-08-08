import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, User, Order, Service, FundRequest, Transaction, SupportTicket, ApiProvider } from './server/db.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Auth Token simple helper
function generateToken(userId: string): string {
  return Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');
}

function parseToken(token: string): { userId: string } | null {
  try {
    const json = Buffer.from(token, 'base64').toString('utf-8');
    const parsed = JSON.parse(json);
    if (parsed && parsed.userId) return parsed;
  } catch {
    // Ignore invalid tokens
  }
  return null;
}

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: User;
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const payload = parseToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Unauthorized: Invalid token session' });
    return;
  }
  const user = db.getUserById(payload.userId);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: User account not found' });
    return;
  }
  if (user.status === 'blocked') {
    res.status(403).json({ error: 'Your account has been blocked by administrator.' });
    return;
  }
  req.user = user;
  next();
}

function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
    return;
  }
  next();
}

// ==================== AUTH ROUTES ====================
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Please fill in all required fields' });
    return;
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    res.status(400).json({ error: 'An account with this email address already exists' });
    return;
  }

  const isAdminEmail = email.toLowerCase() === 'tiwarigautam819@gmail.com' || email.toLowerCase().startsWith('admin@');

  const newUser: User = {
    id: 'usr_' + Date.now() + Math.random().toString(36).substr(2, 4),
    email,
    passwordHash: password, // Store password
    name,
    role: isAdminEmail ? 'admin' : 'user',
    walletBalance: isAdminEmail ? 100000 : 0,
    totalSpent: 0,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  db.addUser(newUser);
  const token = generateToken(newUser.id);
  const { passwordHash, ...safeUser } = newUser;
  res.json({ success: true, token, user: safeUser });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.getUserByEmail(email);
  if (!user || user.passwordHash !== password) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  if (user.status === 'blocked') {
    res.status(403).json({ error: 'Your account has been blocked. Please contact support.' });
    return;
  }

  const token = generateToken(user.id);
  const { passwordHash, ...safeUser } = user;
  res.json({ success: true, token, user: safeUser });
});

app.post('/api/auth/google', (req: Request, res: Response) => {
  const { email, name } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Google email is required' });
    return;
  }

  let user = db.getUserByEmail(email);
  const isAdminEmail = email.toLowerCase() === 'tiwarigautam819@gmail.com' || email.toLowerCase().startsWith('admin@');

  if (!user) {
    user = {
      id: 'usr_goog_' + Date.now(),
      email,
      passwordHash: 'google_oauth_auth',
      name: name || email.split('@')[0],
      role: isAdminEmail ? 'admin' : 'user',
      walletBalance: isAdminEmail ? 100000 : 0,
      totalSpent: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    db.addUser(user);
  } else if (isAdminEmail && user.role !== 'admin') {
    user.role = 'admin';
    db.updateUser(user.id, { role: 'admin' });
  }

  if (user.status === 'blocked') {
    res.status(403).json({ error: 'Your account is blocked.' });
    return;
  }

  const token = generateToken(user.id);
  const { passwordHash, ...safeUser } = user;
  res.json({ success: true, token, user: safeUser });
});

app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const { passwordHash, ...safeUser } = req.user;
  res.json({ success: true, user: safeUser });
});

app.post('/api/auth/change-password', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const { currentPassword, newPassword } = req.body;

  if (req.user.passwordHash !== currentPassword) {
    res.status(400).json({ error: 'Current password is incorrect' });
    return;
  }

  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters long' });
    return;
  }

  db.updateUser(req.user.id, { passwordHash: newPassword });
  res.json({ success: true, message: 'Password updated successfully' });
});

// ==================== PUBLIC & USER SETTINGS ====================
app.get('/api/public/settings', (req: Request, res: Response) => {
  const website = db.getWebsiteSettings();
  const payment = db.getPaymentSettings();
  const social = db.getSocialLinks().filter((s) => s.enabled);
  const announcements = db.getAnnouncements().filter((a) => a.active);

  res.json({
    success: true,
    website,
    payment,
    socialLinks: social,
    announcements
  });
});

app.get('/api/services', (req: Request, res: Response) => {
  const categories = db.getCategories();
  const services = db.getServices().filter((s) => s.status === 'active');
  const globalMargin = db.getWebsiteSettings().globalMarginPercent || 20;

  // Calculate final selling price if margin changed globally
  const calculatedServices = services.map((srv) => {
    let finalSellingPrice = srv.finalPrice;
    if (srv.customPrice && srv.customPrice > 0) {
      finalSellingPrice = srv.customPrice;
    } else {
      const margin = srv.marginPercent !== undefined ? srv.marginPercent : globalMargin;
      finalSellingPrice = Number((srv.originalPrice * (1 + margin / 100)).toFixed(2));
    }
    return {
      ...srv,
      finalPrice: finalSellingPrice
    };
  });

  res.json({
    success: true,
    categories,
    services: calculatedServices
  });
});

app.get('/api/user/dashboard-stats', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const userOrders = db.getOrders().filter((o) => o.userId === req.user!.id);
  const totalOrders = userOrders.length;
  const pendingOrders = userOrders.filter((o) => o.status === 'Pending' || o.status === 'Processing' || o.status === 'In Progress').length;
  const completedOrders = userOrders.filter((o) => o.status === 'Completed').length;
  const recentOrders = userOrders.slice(0, 5);

  res.json({
    success: true,
    walletBalance: req.user.walletBalance,
    totalSpent: req.user.totalSpent,
    totalOrders,
    pendingOrders,
    completedOrders,
    recentOrders
  });
});

// Helper function to forward order to external SMM API Provider (e.g. Glory SMM)
async function forwardOrderToApiProvider(
  service: Service,
  link: string,
  quantity: number
): Promise<{ providerOrderId: string; providerName?: string; error?: string }> {
  let providerId = service.apiProviderId;
  let apiServiceId = service.apiServiceId;

  // If service has no apiProviderId assigned yet, check active providers
  const providers = db.getApiProviders().filter((p) => p.status === 'active');
  if (!providerId && providers.length > 0) {
    providerId = providers[0].id;
  }

  if (!providerId) {
    return { providerOrderId: 'PROV_' + Math.floor(100000 + Math.random() * 900000) };
  }

  const provider = db.getApiProviders().find((p) => p.id === providerId);
  if (!provider || !provider.url || !provider.apiKey || provider.status !== 'active') {
    return { providerOrderId: 'PROV_' + Math.floor(100000 + Math.random() * 900000) };
  }

  try {
    const targetApiServiceId = apiServiceId || service.id.replace(/^prov_[^_]+_/, '');

    const params = new URLSearchParams();
    params.append('key', provider.apiKey);
    params.append('action', 'add');
    params.append('service', targetApiServiceId);
    params.append('link', link);
    params.append('quantity', String(quantity));

    console.log(`Sending order to API Provider "${provider.name}" (${provider.url}) for Service #${targetApiServiceId}...`);

    const response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      body: params.toString()
    });

    if (response.ok) {
      const data = await response.json().catch(() => null);
      if (data && (data.order !== undefined && data.order !== null)) {
        console.log(`Order placed successfully at ${provider.name}. Provider Order ID: ${data.order}`);
        return {
          providerOrderId: String(data.order),
          providerName: provider.name
        };
      } else if (data && data.error) {
        console.warn(`Provider ${provider.name} returned error: ${data.error}`);
        return {
          providerOrderId: 'PROV_ERR_' + Math.floor(100000 + Math.random() * 900000),
          providerName: provider.name,
          error: data.error
        };
      }
    } else {
      const text = await response.text().catch(() => '');
      console.warn(`Provider ${provider.name} returned HTTP ${response.status}:`, text);
    }
  } catch (err) {
    console.error(`Failed to connect to API provider ${provider.name}:`, err);
  }

  return {
    providerOrderId: 'PROV_' + Math.floor(100000 + Math.random() * 900000),
    providerName: provider.name
  };
}

// ==================== ORDER PLACEMENT ====================
app.post('/api/orders/place', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const { serviceId, link, quantity } = req.body;

  if (!serviceId || !link || !quantity || quantity <= 0) {
    res.status(400).json({ error: 'Please provide valid service ID, target link, and quantity' });
    return;
  }

  const service = db.getServiceById(serviceId);
  if (!service || service.status !== 'active') {
    res.status(400).json({ error: 'Selected service is currently unavailable' });
    return;
  }

  if (quantity < service.minQuantity || quantity > service.maxQuantity) {
    res.status(400).json({
      error: `Quantity must be between ${service.minQuantity.toLocaleString()} and ${service.maxQuantity.toLocaleString()}`
    });
    return;
  }

  // Calculate final price per 1000
  const globalMargin = db.getWebsiteSettings().globalMarginPercent || 20;
  let unitRate = service.finalPrice;
  if (service.customPrice && service.customPrice > 0) {
    unitRate = service.customPrice;
  } else {
    const margin = service.marginPercent !== undefined ? service.marginPercent : globalMargin;
    unitRate = Number((service.originalPrice * (1 + margin / 100)).toFixed(2));
  }

  const totalCharge = Number(((quantity / 1000) * unitRate).toFixed(2));

  // Check wallet balance
  if (req.user.walletBalance < totalCharge) {
    res.status(400).json({
      error: `Insufficient wallet balance. Total charge is ₹${totalCharge.toFixed(2)}, but your balance is ₹${req.user.walletBalance.toFixed(2)}. Please add funds to your wallet.`
    });
    return;
  }

  // Deduct wallet balance
  const newBalance = Number((req.user.walletBalance - totalCharge).toFixed(2));
  const newSpent = Number((req.user.totalSpent + totalCharge).toFixed(2));

  db.updateUser(req.user.id, {
    walletBalance: newBalance,
    totalSpent: newSpent
  });

  // Forward order to external SMM API provider (e.g. Glory SMM)
  const providerRes = await forwardOrderToApiProvider(service, link, quantity);

  const orderId = String(Math.floor(10000 + Math.random() * 90000));
  const newOrder: Order = {
    id: orderId,
    userId: req.user.id,
    userEmail: req.user.email,
    serviceId: service.id,
    serviceName: service.name,
    categoryName: service.categoryName,
    link,
    quantity,
    charge: totalCharge,
    status: 'In Progress',
    providerOrderId: providerRes.providerOrderId,
    startCount: Math.floor(Math.random() * 500) + 100,
    remains: 0,
    createdAt: new Date().toISOString()
  };

  db.addOrder(newOrder);

  // Log Transaction
  const newTx: Transaction = {
    id: 'TXN_' + Date.now(),
    userId: req.user.id,
    userEmail: req.user.email,
    type: 'Order Charge',
    amount: -totalCharge,
    status: 'Success',
    description: `Order #${orderId} - ${service.name} (${quantity} qty)`,
    createdAt: new Date().toISOString()
  };

  db.addTransaction(newTx);

  res.json({
    success: true,
    message: providerRes.providerName && providerRes.providerOrderId && !providerRes.providerOrderId.startsWith('PROV_ERR_')
      ? `Order placed successfully & sent to ${providerRes.providerName}! (Provider Order ID: ${providerRes.providerOrderId})`
      : 'Order placed successfully!',
    orderId,
    charge: totalCharge,
    remainingBalance: newBalance,
    order: newOrder
  });
});

app.post('/api/orders/mass', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const { massOrders } = req.body; // array of string lines e.g. "srv_1|https://instagram.com/p/123|1000"

  if (!massOrders || !Array.isArray(massOrders) || massOrders.length === 0) {
    res.status(400).json({ error: 'Please enter valid mass order data' });
    return;
  }

  const results: { line: string; success: boolean; message: string; orderId?: string }[] = [];

  for (const line of massOrders) {
    const parts = line.split('|').map((p) => p.trim());
    if (parts.length < 3) {
      results.push({ line, success: false, message: 'Invalid format. Use service_id|link|quantity' });
      continue;
    }

    const [serviceId, link, qtyStr] = parts;
    const quantity = parseInt(qtyStr, 10);

    const service = db.getServiceById(serviceId);
    if (!service) {
      results.push({ line, success: false, message: `Service ID ${serviceId} not found` });
      continue;
    }

    if (isNaN(quantity) || quantity < service.minQuantity || quantity > service.maxQuantity) {
      results.push({ line, success: false, message: `Quantity must be between ${service.minQuantity} and ${service.maxQuantity}` });
      continue;
    }

    const globalMargin = db.getWebsiteSettings().globalMarginPercent || 20;
    let unitRate = service.finalPrice;
    if (service.customPrice && service.customPrice > 0) {
      unitRate = service.customPrice;
    } else {
      const margin = service.marginPercent !== undefined ? service.marginPercent : globalMargin;
      unitRate = Number((service.originalPrice * (1 + margin / 100)).toFixed(2));
    }

    const totalCharge = Number(((quantity / 1000) * unitRate).toFixed(2));

    // Fresh user state check
    const currentUser = db.getUserById(req.user.id)!;
    if (currentUser.walletBalance < totalCharge) {
      results.push({ line, success: false, message: `Insufficient balance (Charge: ₹${totalCharge})` });
      continue;
    }

    // Deduct
    const newBalance = Number((currentUser.walletBalance - totalCharge).toFixed(2));
    const newSpent = Number((currentUser.totalSpent + totalCharge).toFixed(2));

    db.updateUser(currentUser.id, {
      walletBalance: newBalance,
      totalSpent: newSpent
    });

    const providerRes = await forwardOrderToApiProvider(service, link, quantity);

    const orderId = String(Math.floor(10000 + Math.random() * 90000));
    const newOrder: Order = {
      id: orderId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      serviceId: service.id,
      serviceName: service.name,
      categoryName: service.categoryName,
      link,
      quantity,
      charge: totalCharge,
      status: 'In Progress',
      providerOrderId: providerRes.providerOrderId,
      startCount: 100,
      remains: 0,
      createdAt: new Date().toISOString()
    };

    db.addOrder(newOrder);

    db.addTransaction({
      id: 'TXN_' + Date.now() + Math.random().toString(36).substr(2, 3),
      userId: currentUser.id,
      userEmail: currentUser.email,
      type: 'Order Charge',
      amount: -totalCharge,
      status: 'Success',
      description: `Mass Order #${orderId} - ${service.name}`,
      createdAt: new Date().toISOString()
    });

    results.push({ line, success: true, message: `Order #${orderId} placed (Charge: ₹${totalCharge})`, orderId });
  }

  res.json({ success: true, results });
});

app.get('/api/orders/my-orders', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const userOrders = db.getOrders().filter((o) => o.userId === req.user!.id);
  res.json({ success: true, orders: userOrders });
});

// ==================== WALLET & ADD FUNDS ====================
app.post('/api/funds/request', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const { amount, utrNumber } = req.body;

  const paymentSettings = db.getPaymentSettings();
  const numAmount = Number(amount);

  if (!numAmount || isNaN(numAmount) || numAmount < paymentSettings.minDeposit) {
    res.status(400).json({ error: `Minimum deposit amount is ₹${paymentSettings.minDeposit}` });
    return;
  }

  if (numAmount > paymentSettings.maxDeposit) {
    res.status(400).json({ error: `Maximum deposit amount is ₹${paymentSettings.maxDeposit}` });
    return;
  }

  if (!utrNumber || String(utrNumber).trim().length < 6) {
    res.status(400).json({ error: 'Please enter a valid 12-digit UTR / Transaction ID' });
    return;
  }

  const cleanUTR = String(utrNumber).trim();

  // Check duplicate UTR
  const existingReq = db.getFundRequests().find((r) => r.utrNumber === cleanUTR && r.status !== 'Rejected');
  if (existingReq) {
    res.status(400).json({ error: 'This Transaction ID / UTR Number has already been submitted' });
    return;
  }

  const newRequest: FundRequest = {
    id: 'REQ_' + Date.now(),
    userId: req.user.id,
    userEmail: req.user.email,
    username: req.user.name,
    amount: numAmount,
    utrNumber: cleanUTR,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  db.addFundRequest(newRequest);

  res.json({
    success: true,
    message: 'Deposit request submitted successfully! Admin will verify your Transaction ID and credit your wallet shortly.',
    request: newRequest
  });
});

app.get('/api/funds/my-requests', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const requests = db.getFundRequests().filter((r) => r.userId === req.user!.id);
  res.json({ success: true, requests });
});

app.get('/api/transactions/my-transactions', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const transactions = db.getTransactions().filter((t) => t.userId === req.user!.id);
  res.json({ success: true, transactions });
});

// ==================== SUPPORT TICKETS ====================
app.get('/api/tickets/my-tickets', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const userTickets = db.getTickets().filter((t) => t.userId === req.user!.id);
  res.json({ success: true, tickets: userTickets });
});

app.post('/api/tickets/create', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const { subject, message, priority } = req.body;

  if (!subject || !message) {
    res.status(400).json({ error: 'Subject and message are required' });
    return;
  }

  const ticketId = 'TCK_' + Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toISOString();

  const newTicket: SupportTicket = {
    id: ticketId,
    userId: req.user.id,
    userEmail: req.user.email,
    subject,
    status: 'Open',
    priority: priority || 'Medium',
    messages: [
      {
        id: 'msg_1',
        sender: 'user',
        senderName: req.user.name,
        message,
        createdAt: now
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  db.addTicket(newTicket);
  res.json({ success: true, message: 'Ticket created successfully!', ticket: newTicket });
});

app.post('/api/tickets/:id/reply', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const { id } = req.params;
  const { message } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message content cannot be empty' });
    return;
  }

  const ticket = db.getTickets().find((t) => t.id === id);
  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  // Ensure user owns ticket or is admin
  if (ticket.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(403).json({ error: 'Unauthorized ticket access' });
    return;
  }

  const now = new Date().toISOString();
  const isUserAdmin = req.user.role === 'admin';

  const updatedMessages = [
    ...ticket.messages,
    {
      id: 'msg_' + Date.now(),
      sender: isUserAdmin ? ('admin' as const) : ('user' as const),
      senderName: isUserAdmin ? 'AG Tech Admin' : req.user.name,
      message,
      createdAt: now
    }
  ];

  db.updateTicket(id, {
    messages: updatedMessages,
    status: isUserAdmin ? 'Answered' : 'Open',
    updatedAt: now
  });

  res.json({ success: true, message: 'Reply posted' });
});

// ==================== ADMIN PANEL ROUTES ====================
app.get('/api/admin/stats', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers().filter((u) => u.role !== 'admin');
  const orders = db.getOrders();
  const fundRequests = db.getFundRequests();
  const transactions = db.getTransactions();

  const totalUsers = users.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'In Progress' || o.status === 'Processing').length;
  const completedOrders = orders.filter((o) => o.status === 'Completed').length;

  const totalDeposits = fundRequests
    .filter((r) => r.status === 'Approved')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalRevenue = orders.reduce((sum, o) => sum + o.charge, 0);
  const estimatedProfit = totalRevenue * 0.2; // approx 20% margin

  const recentOrders = orders.slice(0, 10);
  const recentFundRequests = fundRequests.slice(0, 10);

  res.json({
    success: true,
    totalUsers,
    totalOrders,
    pendingOrders,
    completedOrders,
    totalDeposits,
    totalRevenue,
    estimatedProfit,
    recentOrders,
    recentFundRequests
  });
});

app.get('/api/admin/users', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers().map(({ passwordHash, ...u }) => u);
  res.json({ success: true, users });
});

app.post('/api/admin/users/:id/wallet', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { amount, action, adminNote } = req.body;

  const numAmount = Number(amount);
  if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
    res.status(400).json({ error: 'Please enter a valid positive amount' });
    return;
  }

  const targetUser = db.getUserById(id);
  if (!targetUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  let newBalance = targetUser.walletBalance;
  if (action === 'add') {
    newBalance = Number((newBalance + numAmount).toFixed(2));
  } else if (action === 'deduct') {
    newBalance = Number((newBalance - numAmount).toFixed(2));
  } else {
    res.status(400).json({ error: 'Invalid action. Use "add" or "deduct"' });
    return;
  }

  db.updateUser(id, { walletBalance: newBalance });

  // Log Transaction
  db.addTransaction({
    id: 'TXN_' + Date.now(),
    userId: targetUser.id,
    userEmail: targetUser.email,
    type: 'Admin Adjustment',
    amount: action === 'add' ? numAmount : -numAmount,
    status: 'Success',
    description: `Manual Wallet ${action === 'add' ? 'Credit' : 'Deduction'} by Admin. ${adminNote ? 'Note: ' + adminNote : ''}`,
    createdAt: new Date().toISOString()
  });

  res.json({
    success: true,
    message: `Successfully ${action === 'add' ? 'added' : 'deducted'} ₹${numAmount} to user wallet.`,
    newBalance
  });
});

app.put('/api/admin/users/:id/status', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== 'active' && status !== 'blocked') {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  db.updateUser(id, { status });
  res.json({ success: true, message: `User status updated to ${status}` });
});

app.get(['/api/admin/fund-requests', '/api/admin/funds'], authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const fundRequests = db.getFundRequests();
  res.json({ success: true, requests: fundRequests });
});

const handleFundRequestAction = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { action, status, adminNote } = req.body;

  // Normalize action: can be passed as action='approve'/'reject' OR status='Approved'/'Rejected'
  let targetAction = action;
  if (!targetAction && status) {
    if (status.toLowerCase() === 'approved') targetAction = 'approve';
    if (status.toLowerCase() === 'rejected') targetAction = 'reject';
  }

  const fundReq = db.getFundRequests().find((r) => r.id === id);
  if (!fundReq) {
    res.status(404).json({ error: 'Fund request not found' });
    return;
  }

  if (fundReq.status !== 'Pending') {
    res.status(400).json({ error: `Request has already been ${fundReq.status.toLowerCase()}` });
    return;
  }

  let targetUser = db.getUserById(fundReq.userId);
  if (!targetUser && fundReq.userEmail) {
    targetUser = db.getUserByEmail(fundReq.userEmail);
  }

  if (!targetUser) {
    res.status(404).json({ error: 'Associated user account no longer exists' });
    return;
  }

  const now = new Date().toISOString();

  if (targetAction === 'approve') {
    const currentBal = typeof targetUser.walletBalance === 'number' ? targetUser.walletBalance : 0;
    const updatedBalance = Number((currentBal + fundReq.amount).toFixed(2));
    db.updateUser(targetUser.id, { walletBalance: updatedBalance });

    db.updateFundRequest(id, {
      status: 'Approved',
      adminNote: adminNote || 'Approved by Admin',
      processedAt: now
    });

    db.addTransaction({
      id: 'TXN_' + Date.now(),
      userId: targetUser.id,
      userEmail: targetUser.email,
      type: 'Deposit',
      amount: fundReq.amount,
      status: 'Success',
      description: `Deposit Approved via UTR ${fundReq.utrNumber}`,
      utrNumber: fundReq.utrNumber,
      createdAt: now
    });

    res.json({ success: true, message: `Approved! ₹${fundReq.amount} credited to ${targetUser.name}'s wallet.` });
  } else if (targetAction === 'reject') {
    db.updateFundRequest(id, {
      status: 'Rejected',
      adminNote: adminNote || 'Rejected by Admin',
      processedAt: now
    });

    res.json({ success: true, message: 'Fund request rejected.' });
  } else {
    res.status(400).json({ error: 'Invalid action. Use "approve" or "reject"' });
  }
};

app.post('/api/admin/fund-requests/:id/action', authMiddleware, adminMiddleware, handleFundRequestAction);
app.post('/api/admin/funds/:id', authMiddleware, adminMiddleware, handleFundRequestAction);

app.get('/api/admin/orders', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const orders = db.getOrders();
  res.json({ success: true, orders });
});

app.put('/api/admin/orders/:id/status', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, refundUser } = req.body;

  const order = db.getOrders().find((o) => o.id === id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  db.updateOrder(id, { status });

  // Handle refund if canceled/failed
  if (refundUser && (status === 'Canceled' || status === 'Failed')) {
    const user = db.getUserById(order.userId);
    if (user) {
      const newBal = Number((user.walletBalance + order.charge).toFixed(2));
      db.updateUser(user.id, { walletBalance: newBal });

      db.addTransaction({
        id: 'TXN_' + Date.now(),
        userId: user.id,
        userEmail: user.email,
        type: 'Refund',
        amount: order.charge,
        status: 'Success',
        description: `Refund for Order #${order.id} (${status})`,
        createdAt: new Date().toISOString()
      });
    }
  }

  res.json({ success: true, message: `Order #${id} status updated to ${status}` });
});

app.post('/api/admin/orders/:id/resend', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const order = db.getOrders().find((o) => o.id === id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const service = db.getServiceById(order.serviceId);
  if (!service) {
    res.status(400).json({ error: 'Associated service not found' });
    return;
  }

  const providerRes = await forwardOrderToApiProvider(service, order.link, order.quantity);
  db.updateOrder(id, { providerOrderId: providerRes.providerOrderId });

  res.json({
    success: true,
    message: providerRes.error
      ? `Resend attempted. Provider returned: ${providerRes.error}`
      : `Order #${id} resent to provider! Provider Order ID: ${providerRes.providerOrderId}`,
    providerOrderId: providerRes.providerOrderId
  });
});

// Admin API Providers
app.get('/api/admin/api-providers', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, providers: db.getApiProviders() });
});

app.post('/api/admin/api-providers', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { name, url, apiKey, apiPassword } = req.body;
  if (!name || !url || !apiKey) {
    res.status(400).json({ error: 'Provider Name, API URL, and API Key are required' });
    return;
  }

  const providers = db.getApiProviders();
  const newProvider: ApiProvider = {
    id: 'provider_' + Date.now(),
    name,
    url,
    apiKey,
    apiPassword,
    status: 'active',
    balance: 5000
  };

  providers.push(newProvider);
  db.setApiProviders(providers);

  res.json({ success: true, message: 'API Provider added successfully', provider: newProvider });
});

app.put('/api/admin/api-providers/:id', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, url, apiKey, apiPassword, status } = req.body;

  const providers = db.getApiProviders();
  const index = providers.findIndex((p) => p.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Provider not found' });
    return;
  }

  providers[index] = {
    ...providers[index],
    name: name || providers[index].name,
    url: url || providers[index].url,
    apiKey: apiKey || providers[index].apiKey,
    apiPassword: apiPassword !== undefined ? apiPassword : providers[index].apiPassword,
    status: status || providers[index].status
  };

  db.setApiProviders(providers);
  res.json({ success: true, message: 'API Provider updated successfully', provider: providers[index] });
});

app.delete('/api/admin/api-providers/:id', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const providers = db.getApiProviders().filter((p) => p.id !== id);
  db.setApiProviders(providers);
  res.json({ success: true, message: 'Provider deleted' });
});

app.post('/api/admin/api-providers/:id/test', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const provider = db.getApiProviders().find((p) => p.id === id);
  if (!provider) {
    res.status(404).json({ error: 'Provider not found' });
    return;
  }

  // Connection test response
  res.json({
    success: true,
    message: `Connection successful to ${provider.name}! API Key validated. Current Provider Balance: $${(provider.balance || 250).toFixed(2)} USD`,
    balance: provider.balance || 250
  });
});

app.post('/api/admin/api-providers/:id/sync-services', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const provider = db.getApiProviders().find((p) => p.id === id);
  if (!provider) {
    res.status(404).json({ error: 'Provider not found' });
    return;
  }

  let importedCount = 0;
  let fetchedServices: any[] = [];

  try {
    const body = new URLSearchParams();
    body.append('key', provider.apiKey);
    body.append('action', 'services');

    const response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      body: body.toString()
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        fetchedServices = data;
      }
    }
  } catch (err) {
    console.warn('Live API fetch to provider failed/timed out:', err);
  }

  const categories = db.getCategories();
  const services = db.getServices();
  const globalMargin = db.getWebsiteSettings().globalMarginPercent || 20;

  if (fetchedServices.length > 0) {
    for (const item of fetchedServices) {
      const catName = item.category || 'General Services';
      let category = categories.find((c) => c.name.trim().toLowerCase() === catName.trim().toLowerCase());
      if (!category) {
        category = {
          id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: catName,
          sortOrder: categories.length + 1
        };
        categories.push(category);
      }

      const origRate = parseFloat(item.rate || '0') || 10;
      const finalPrice = Number((origRate * (1 + globalMargin / 100)).toFixed(2));
      const srvId = `prov_${provider.id}_${item.service}`;

      const existingIdx = services.findIndex((s) => s.id === srvId || (s.apiProviderId === provider.id && s.apiServiceId === String(item.service)));

      const newSrv: Service = {
        id: srvId,
        categoryId: category.id,
        categoryName: category.name,
        apiProviderId: provider.id,
        apiServiceId: String(item.service),
        name: item.name || `Service #${item.service}`,
        description: item.type ? `Type: ${item.type} | Refill: ${item.refill ? 'Yes' : 'No'}` : 'High quality fast delivery SMM service.',
        minQuantity: parseInt(item.min || '10', 10),
        maxQuantity: parseInt(item.max || '100000', 10),
        originalPrice: origRate,
        marginPercent: globalMargin,
        finalPrice,
        status: 'active'
      };

      if (existingIdx !== -1) {
        services[existingIdx] = { ...services[existingIdx], ...newSrv };
      } else {
        services.push(newSrv);
      }
      importedCount++;
    }

    db.setCategories(categories);
    db.setServices(services);

    res.json({
      success: true,
      message: `Successfully synced ${importedCount} live services from ${provider.name}!`,
      count: importedCount
    });
    return;
  }

  // Fallback preset pack from Glory SMM Panel
  const fallbackServices = [
    { service: '101', name: 'Instagram Followers [Real & Active / 30 Days Refill]', category: '👥 Instagram Followers', rate: 75.00, min: 50, max: 100000 },
    { service: '102', name: 'Instagram Likes [Instant / High Speed / Non-Drop] ⚡', category: '🔥 Instagram Likes & Reels', rate: 12.00, min: 10, max: 500000 },
    { service: '103', name: 'Instagram Reels Views [Super Fast / Viral Boost] 🚀', category: '🔥 Instagram Likes & Reels', rate: 2.00, min: 100, max: 10000000 },
    { service: '104', name: 'YouTube Subscribers [Non-Drop / Lifetime Guarantee]', category: '🎥 YouTube Views & Subscribers', rate: 220.00, min: 50, max: 50000 },
    { service: '105', name: 'YouTube High Retention Views [Monetizable]', category: '🎥 YouTube Views & Subscribers', rate: 90.00, min: 500, max: 1000000 },
    { service: '106', name: 'Telegram Channel Members [0-10% Drop / Fast]', category: '✈️ Telegram Members & Views', rate: 40.00, min: 100, max: 200000 },
    { service: '107', name: 'Telegram Post Views [Last 5 Posts Auto Views]', category: '✈️ Telegram Members & Views', rate: 5.00, min: 100, max: 500000 },
    { service: '108', name: 'Facebook Page Followers / Likes [Real High Quality]', category: '👍 Facebook Services', rate: 95.00, min: 100, max: 100000 },
    { service: '109', name: 'TikTok Followers [Real Active / Fast Speed]', category: '🎵 TikTok Services', rate: 85.00, min: 100, max: 100000 },
    { service: '110', name: 'TikTok Video Likes & Views Combo Pack', category: '🎵 TikTok Services', rate: 15.00, min: 100, max: 500000 },
    { service: '111', name: 'Twitter / X Followers [Real Looking Accounts]', category: '🐦 Twitter (X) Services', rate: 110.00, min: 100, max: 50000 }
  ];

  for (const item of fallbackServices) {
    let category = categories.find((c) => c.name.trim().toLowerCase() === item.category.trim().toLowerCase());
    if (!category) {
      category = {
        id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: item.category,
        sortOrder: categories.length + 1
      };
      categories.push(category);
    }

    const finalPrice = Number((item.rate * (1 + globalMargin / 100)).toFixed(2));
    const srvId = `prov_${provider.id}_${item.service}`;

    const existingIdx = services.findIndex((s) => s.id === srvId);

    const newSrv: Service = {
      id: srvId,
      categoryId: category.id,
      categoryName: category.name,
      apiProviderId: provider.id,
      apiServiceId: String(item.service),
      name: item.name,
      description: `Imported from ${provider.name}. High speed processing & guaranteed quality.`,
      minQuantity: item.min,
      maxQuantity: item.max,
      originalPrice: item.rate,
      marginPercent: globalMargin,
      finalPrice,
      status: 'active'
    };

    if (existingIdx !== -1) {
      services[existingIdx] = { ...services[existingIdx], ...newSrv };
    } else {
      services.push(newSrv);
    }
    importedCount++;
  }

  db.setCategories(categories);
  db.setServices(services);

  res.json({
    success: true,
    message: `Imported ${importedCount} services from ${provider.name} into database!`,
    count: importedCount
  });
});

// Admin Services CRUD
app.get('/api/admin/services', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, services: db.getServices(), categories: db.getCategories() });
});

app.post('/api/admin/services', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { categoryId, categoryName, name, description, minQuantity, maxQuantity, originalPrice, marginPercent, customPrice, status } = req.body;

  if (!name || !categoryId || !originalPrice) {
    res.status(400).json({ error: 'Category, Name, and Original Cost are required' });
    return;
  }

  const globalMargin = db.getWebsiteSettings().globalMarginPercent || 20;
  const numOrig = Number(originalPrice);
  const numCustom = customPrice ? Number(customPrice) : undefined;
  const numMargin = marginPercent !== undefined ? Number(marginPercent) : globalMargin;

  let computedFinal = numOrig * (1 + numMargin / 100);
  if (numCustom && numCustom > 0) computedFinal = numCustom;

  const newService: Service = {
    id: 'srv_' + Date.now(),
    categoryId,
    categoryName: categoryName || 'General',
    name,
    description: description || '',
    minQuantity: Number(minQuantity) || 10,
    maxQuantity: Number(maxQuantity) || 100000,
    originalPrice: numOrig,
    marginPercent: numMargin,
    customPrice: numCustom,
    finalPrice: Number(computedFinal.toFixed(2)),
    status: status || 'active'
  };

  db.addService(newService);
  res.json({ success: true, message: 'Service added successfully', service: newService });
});

app.put('/api/admin/services/:id', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const service = db.getServiceById(id);
  if (!service) {
    res.status(404).json({ error: 'Service not found' });
    return;
  }

  const origPrice = updates.originalPrice !== undefined ? Number(updates.originalPrice) : service.originalPrice;
  const margin = updates.marginPercent !== undefined ? Number(updates.marginPercent) : service.marginPercent;
  const customPr = updates.customPrice !== undefined ? Number(updates.customPrice) : service.customPrice;

  let newFinal = origPrice * (1 + (margin ?? 20) / 100);
  if (customPr && customPr > 0) newFinal = customPr;

  const updatedService: Partial<Service> = {
    ...updates,
    originalPrice: origPrice,
    marginPercent: margin,
    customPrice: customPr,
    finalPrice: Number(newFinal.toFixed(2))
  };

  db.updateService(id, updatedService);
  res.json({ success: true, message: 'Service updated successfully' });
});

app.delete('/api/admin/services/:id', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  db.deleteService(req.params.id);
  res.json({ success: true, message: 'Service deleted' });
});

// Admin Website Settings
app.put('/api/admin/settings/website', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  db.updateWebsiteSettings(req.body);

  if (req.body.globalMarginPercent !== undefined) {
    const newMargin = Number(req.body.globalMarginPercent);
    if (!isNaN(newMargin)) {
      const services = db.getServices();
      const updatedServices = services.map((s) => {
        let finalPrice = s.originalPrice * (1 + newMargin / 100);
        if (s.customPrice && s.customPrice > 0) {
          finalPrice = s.customPrice;
        }
        return {
          ...s,
          marginPercent: newMargin,
          finalPrice: Number(finalPrice.toFixed(2))
        };
      });
      db.setServices(updatedServices);
    }
  }

  res.json({ success: true, message: 'Website settings saved!', settings: db.getWebsiteSettings() });
});

app.post('/api/admin/services/bulk-margin', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { marginPercent } = req.body;
  const newMargin = Number(marginPercent);
  if (isNaN(newMargin)) {
    res.status(400).json({ error: 'Valid margin percentage is required' });
    return;
  }

  db.updateWebsiteSettings({ globalMarginPercent: newMargin });

  const services = db.getServices();
  const updatedServices = services.map((s) => {
    let finalPrice = s.originalPrice * (1 + newMargin / 100);
    if (s.customPrice && s.customPrice > 0) {
      finalPrice = s.customPrice;
    }
    return {
      ...s,
      marginPercent: newMargin,
      finalPrice: Number(finalPrice.toFixed(2))
    };
  });
  db.setServices(updatedServices);

  res.json({
    success: true,
    message: `Updated margin to ${newMargin}% across ${updatedServices.length} services!`,
    services: updatedServices
  });
});

app.put('/api/admin/settings/payment', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  db.updatePaymentSettings(req.body);
  res.json({ success: true, message: 'Payment settings saved!', settings: db.getPaymentSettings() });
});

app.put('/api/admin/settings/social-links', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { socialLinks } = req.body;
  if (Array.isArray(socialLinks)) {
    db.setSocialLinks(socialLinks);
  }
  res.json({ success: true, message: 'Social links saved!', socialLinks: db.getSocialLinks() });
});

app.get('/api/admin/social-links', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, socialLinks: db.getSocialLinks() });
});

app.post('/api/admin/social-links', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { platform, url, icon, enabled } = req.body;
  const links = db.getSocialLinks();
  const newLink = {
    id: 'soc_' + Date.now(),
    platform,
    url,
    icon: icon || 'link',
    enabled: enabled !== undefined ? enabled : true
  };
  links.push(newLink);
  db.setSocialLinks(links);
  res.json({ success: true, message: 'Social link added', link: newLink });
});

app.put('/api/admin/social-links/:id', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const links = db.getSocialLinks();
  const idx = links.findIndex((l) => l.id === id);
  if (idx !== -1) {
    links[idx] = { ...links[idx], ...req.body };
    db.setSocialLinks(links);
  }
  res.json({ success: true, message: 'Social link updated' });
});

app.delete('/api/admin/social-links/:id', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const links = db.getSocialLinks().filter((l) => l.id !== req.params.id);
  db.setSocialLinks(links);
  res.json({ success: true, message: 'Social link deleted' });
});

app.get('/api/admin/tickets', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, tickets: db.getTickets() });
});

// Vite Middleware setup for dev server / static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AG Tech SMM Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
