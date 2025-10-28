import { getStorageItem, setStorageItem } from './storageHelpers';

interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  user_metadata?: {
    name?: string;
    walletAddress?: string;
    walletProvider?: string;
  };
  provider?: 'email' | 'google' | 'wallet';
  walletAddress?: string;
  walletProvider?: string;
  publicKey?: string;
  createdAt: string;
}

interface TokenBalance {
  userId: string;
  tokens: number;
  staked: number;
  lastUpdated: string;
}

interface Transaction {
  id: string;
  userId: string;
  type: 'earned' | 'staked' | 'unstaked' | 'transferred';
  amount: number;
  description: string;
  timestamp: string;
}

interface Hotspot {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'online' | 'offline' | 'maintenance';
  operatorId: string;
  earnings: number;
  users: number;
  uptime: number;
  createdAt: string;
}

interface DeliveryPartner {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  rating: number;
  deliveries: number;
  earnings: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface Farm {
  id: string;
  name: string;
  ownerId: string;
  location: string;
  size: number;
  cropType: string;
  sensors: number;
  lastUpdate: string;
  earnings: number;
  createdAt: string;
}

interface HealthcareProvider {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'diagnostic_center' | 'pharmacy';
  location: string;
  address: string;
  license: string;
  capacity: number; // beds/patients per day
  dataPoints: number; // number of anonymized records shared
  earnings: number;
  status: 'active' | 'inactive' | 'pending';
  registeredBy: string;
  createdAt: string;
}

interface TaxCollectionPoint {
  id: string;
  name: string;
  type: 'fbr_office' | 'provincial_office' | 'excise_office' | 'customs_office';
  location: string;
  address: string;
  jurisdiction: string;
  transactionsLogged: number;
  dataPoints: number;
  earnings: number;
  status: 'active' | 'inactive';
  registeredBy: string;
  createdAt: string;
}

interface Notification {
  id: string;
  userId: string;
  type: 'reward' | 'system' | 'verification' | 'governance' | 'security';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

interface BillPayment {
  id: string;
  userId?: string;
  provider: string;
  category: 'electricity' | 'healthcare' | 'taxation';
  accountNumber: string;
  billAmount: number;
  buildTokensUsed: number;
  conversionRate: number;
  timestamp: string;
}

interface TokenTransfer {
  id: string;
  from: string;
  to: string;
  amount: number;
  memo: string;
  type: 'sent' | 'received';
  timestamp: string;
}

interface ChargingPlot {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  city: string;
  ownerId: string;
  status: 'available' | 'occupied' | 'reserved';
  price: number; // Purchase price in BUILD tokens
  purchasedAt?: string;
}

interface PlotListing {
  id: string;
  plotId: string;
  sellerId: string;
  sellerName: string;
  location: string;
  city: string;
  originalPrice: number;
  salePrice: number;
  listedAt: string;
  status: 'active' | 'sold' | 'cancelled';
}

interface EVCharger {
  id: string;
  plotId: string;
  ownerId: string;
  name: string;
  type: 'level1' | 'level2' | 'dcfast' | 'tesla_supercharger';
  powerOutput: number; // kW
  status: 'online' | 'offline' | 'maintenance' | 'charging';
  pricing: {
    perKwh?: number; // PKR per kWh
    perSecond?: number; // PKR per second
    model: 'per_kwh' | 'per_second';
  };
  totalSessions: number;
  totalEnergy: number; // kWh
  earnings: number; // BUILD tokens
  installCost: number; // BUILD tokens invested
  installedAt: string;
}

interface ChargingSession {
  id: string;
  chargerId: string;
  userId: string;
  vehicleType: string;
  startTime: string;
  endTime?: string;
  energyUsed: number; // kWh
  duration: number; // seconds
  cost: number; // PKR
  pointsEarned: number;
  paymentMethod: 'solana_pay' | 'fiat' | 'build_tokens';
  transactionHash?: string; // Solana transaction ID
  status: 'active' | 'completed' | 'cancelled';
}

interface ChargingPoints {
  userId: string;
  points: number;
  earned: number;
  traded: number;
  lastUpdated: string;
}

interface PointTransaction {
  id: string;
  from: string;
  to: string;
  points: number;
  buildTokens: number;
  discount: number; // percentage
  type: 'buy' | 'sell';
  transactionHash?: string;
  timestamp: string;
}

interface MarketplaceListing {
  id: string;
  sellerId: string;
  sellerName: string;
  points: number;
  buildTokens: number;
  discount: number; // percentage off regular price
  regularPrice: number; // calculated BUILD token value at regular rate
  location: string;
  status: 'active' | 'sold' | 'cancelled';
  createdAt: string;
}

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  code: string;
  status: 'pending' | 'completed';
  reward: number;
  createdAt: string;
}

interface VerificationQueue {
  id: string;
  resourceType: 'hotspot' | 'partner' | 'farm' | 'healthcare' | 'tax_point';
  resourceId: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

interface GovernanceProposal {
  id: string;
  proposerId: string;
  title: string;
  description: string;
  type: 'parameter_change' | 'treasury_allocation' | 'feature_request' | 'partnership';
  status: 'active' | 'passed' | 'rejected' | 'executed';
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorum: number;
  startTime: string;
  endTime: string;
  createdAt: string;
}

interface Vote {
  id: string;
  proposalId: string;
  voterId: string;
  vote: 'for' | 'against' | 'abstain';
  votingPower: number;
  createdAt: string;
}

class LocalDatabase {
  private getKey(table: string): string {
    return `pakistani_depin_${table}`;
  }

  private get<T>(key: string): T[] 
  private get<T>(key: string, defaultValue: T): T
  private get<T>(key: string, defaultValue?: T): T[] | T {
    const data = getStorageItem(key);
    if (!data) {
      return defaultValue !== undefined ? defaultValue : [];
    }
    
    try {
      return JSON.parse(data);
    } catch (error) {
      console.warn(`Failed to parse data for key ${key}:`, error);
      return defaultValue !== undefined ? defaultValue : [];
    }
  }

  private set<T>(key: string, data: T[] | T): void {
    try {
      const success = setStorageItem(key, JSON.stringify(data));
      if (!success) {
        console.warn(`Failed to save data for key ${key}`);
      }
    } catch (error) {
      console.warn(`Failed to serialize data for key ${key}:`, error);
    }
  }

  generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Users
  getUsers(): User[] {
    return this.get<User>(this.getKey('users'));
  }

  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    const user: User = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    this.set(this.getKey('users'), users);
    return user;
  }

  getUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.email === email) || null;
  }

  getUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.id === id) || null;
  }

  getAllUsers(): User[] {
    return this.getUsers();
  }

  getUserByWalletAddress(walletAddress: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.walletAddress === walletAddress) || null;
  }

  // Token Balances
  getTokenBalance(userId: string): TokenBalance {
    const balances = this.get<TokenBalance>(this.getKey('token_balances'));
    const existing = balances.find(b => b.userId === userId);
    
    if (existing) {
      return existing;
    }

    // Create default balance for new user
    const newBalance: TokenBalance = {
      userId,
      tokens: 100, // Starting bonus
      staked: 0,
      lastUpdated: new Date().toISOString(),
    };
    
    balances.push(newBalance);
    this.set(this.getKey('token_balances'), balances);
    return newBalance;
  }

  updateTokenBalance(userId: string, updates: Partial<TokenBalance>): void {
    const balances = this.get<TokenBalance>(this.getKey('token_balances'));
    const index = balances.findIndex(b => b.userId === userId);
    
    if (index >= 0) {
      balances[index] = { ...balances[index], ...updates, lastUpdated: new Date().toISOString() };
    } else {
      balances.push({
        userId,
        tokens: updates.tokens || 0,
        staked: updates.staked || 0,
        lastUpdated: new Date().toISOString(),
      });
    }
    
    this.set(this.getKey('token_balances'), balances);
    
    // Notify UI components that token balance has changed
    window.dispatchEvent(new CustomEvent('tokenBalanceUpdated', { 
      detail: { userId, balance: balances[index >= 0 ? index : balances.length - 1] } 
    }));
  }

  // Transactions
  getTransactions(userId: string): Transaction[] {
    const transactions = this.get<Transaction>(this.getKey('transactions'));
    return transactions.filter(t => t.userId === userId);
  }

  createTransaction(userId: string, transactionData: Omit<Transaction, 'id' | 'userId' | 'timestamp'>): Transaction {
    const transactions = this.get<Transaction>(this.getKey('transactions'));
    const transaction: Transaction = {
      ...transactionData,
      userId,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
    };
    transactions.push(transaction);
    this.set(this.getKey('transactions'), transactions);
    
    // Update user balance based on transaction
    const balance = this.getTokenBalance(userId);
    const newBalance = balance.tokens + transactionData.amount;
    this.updateTokenBalance(userId, { tokens: newBalance });
    
    return transaction;
  }

  // Bill Payments
  getBillPayments(): BillPayment[] {
    return this.get<BillPayment>(this.getKey('bill_payments'));
  }

  createBillPayment(paymentData: Omit<BillPayment, 'id' | 'timestamp'>): BillPayment {
    const payments = this.getBillPayments();
    const payment: BillPayment = {
      ...paymentData,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
    };
    payments.push(payment);
    this.set(this.getKey('bill_payments'), payments);
    return payment;
  }

  // Token Transfers
  getTokenTransfers(type?: 'sent' | 'received', userId?: string): TokenTransfer[] {
    let transfers = this.get<TokenTransfer>(this.getKey('token_transfers'));
    
    // Filter by userId if provided
    if (userId) {
      if (type === 'sent') {
        transfers = transfers.filter(t => t.from === userId);
      } else if (type === 'received') {
        transfers = transfers.filter(t => t.to === userId);
      }
    } else if (type) {
      // Backwards compatibility: filter by type only if no userId
      transfers = transfers.filter(t => t.type === type);
    }
    
    return transfers;
  }

  createTokenTransfer(transferData: Omit<TokenTransfer, 'id' | 'timestamp'>): TokenTransfer {
    const transfers = this.getTokenTransfers();
    const transfer: TokenTransfer = {
      ...transferData,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
    };
    transfers.push(transfer);
    this.set(this.getKey('token_transfers'), transfers);
    return transfer;
  }

  // Hotspots
  getHotspots(): Hotspot[] {
    return this.get<Hotspot>(this.getKey('hotspots'));
  }

  createHotspot(hotspotData: Omit<Hotspot, 'id' | 'createdAt'>): Hotspot {
    const hotspots = this.getHotspots();
    const hotspot: Hotspot = {
      ...hotspotData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    hotspots.push(hotspot);
    this.set(this.getKey('hotspots'), hotspots);
    return hotspot;
  }

  updateHotspot(id: string, updates: Partial<Hotspot>): void {
    const hotspots = this.getHotspots();
    const index = hotspots.findIndex(h => h.id === id);
    if (index >= 0) {
      hotspots[index] = { ...hotspots[index], ...updates };
      this.set(this.getKey('hotspots'), hotspots);
    }
  }

  // Delivery Partners
  getDeliveryPartners(): DeliveryPartner[] {
    return this.get<DeliveryPartner>(this.getKey('delivery_partners'));
  }

  createDeliveryPartner(partnerData: Omit<DeliveryPartner, 'id' | 'createdAt'>): DeliveryPartner {
    const partners = this.getDeliveryPartners();
    const partner: DeliveryPartner = {
      ...partnerData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    partners.push(partner);
    this.set(this.getKey('delivery_partners'), partners);
    return partner;
  }

  // Farms
  getFarms(): Farm[] {
    return this.get<Farm>(this.getKey('farms'));
  }

  createFarm(farmData: Omit<Farm, 'id' | 'createdAt'>): Farm {
    const farms = this.getFarms();
    const farm: Farm = {
      ...farmData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    farms.push(farm);
    this.set(this.getKey('farms'), farms);
    return farm;
  }

  // Healthcare Providers
  getHealthcareProviders(): HealthcareProvider[] {
    return this.get<HealthcareProvider>(this.getKey('healthcare_providers'));
  }

  createHealthcareProvider(providerData: Omit<HealthcareProvider, 'id' | 'createdAt'>): HealthcareProvider {
    const providers = this.getHealthcareProviders();
    const provider: HealthcareProvider = {
      ...providerData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    providers.push(provider);
    this.set(this.getKey('healthcare_providers'), providers);
    return provider;
  }

  updateHealthcareProvider(id: string, updates: Partial<HealthcareProvider>): void {
    const providers = this.getHealthcareProviders();
    const index = providers.findIndex(p => p.id === id);
    if (index >= 0) {
      providers[index] = { ...providers[index], ...updates };
      this.set(this.getKey('healthcare_providers'), providers);
    }
  }

  // Tax Collection Points
  getTaxCollectionPoints(): TaxCollectionPoint[] {
    return this.get<TaxCollectionPoint>(this.getKey('tax_collection_points'));
  }

  createTaxCollectionPoint(pointData: Omit<TaxCollectionPoint, 'id' | 'createdAt'>): TaxCollectionPoint {
    const points = this.getTaxCollectionPoints();
    const point: TaxCollectionPoint = {
      ...pointData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    points.push(point);
    this.set(this.getKey('tax_collection_points'), points);
    return point;
  }

  updateTaxCollectionPoint(id: string, updates: Partial<TaxCollectionPoint>): void {
    const points = this.getTaxCollectionPoints();
    const index = points.findIndex(p => p.id === id);
    if (index >= 0) {
      points[index] = { ...points[index], ...updates };
      this.set(this.getKey('tax_collection_points'), points);
    }
  }

  // Notifications
  getNotifications(userId: string): Notification[] {
    const notifications = this.get<Notification>(this.getKey('notifications'));
    return notifications.filter(n => n.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Notification {
    const notifications = this.get<Notification>(this.getKey('notifications'));
    const notification: Notification = {
      ...notificationData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    notifications.push(notification);
    this.set(this.getKey('notifications'), notifications);
    return notification;
  }

  markNotificationAsRead(id: string): void {
    const notifications = this.get<Notification>(this.getKey('notifications'));
    const index = notifications.findIndex(n => n.id === id);
    if (index >= 0) {
      notifications[index].read = true;
      this.set(this.getKey('notifications'), notifications);
    }
  }

  markAllNotificationsAsRead(userId: string): void {
    const notifications = this.get<Notification>(this.getKey('notifications'));
    const updated = notifications.map(n => 
      n.userId === userId ? { ...n, read: true } : n
    );
    this.set(this.getKey('notifications'), updated);
  }

  // Audit Logs
  getAuditLogs(userId?: string): AuditLog[] {
    const logs = this.get<AuditLog>(this.getKey('audit_logs'));
    if (userId) {
      return logs.filter(l => l.userId === userId);
    }
    return logs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  createAuditLog(logData: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const logs = this.get<AuditLog>(this.getKey('audit_logs'));
    const log: AuditLog = {
      ...logData,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
    };
    logs.push(log);
    this.set(this.getKey('audit_logs'), logs);
    return log;
  }

  // Referrals
  getReferrals(userId?: string): Referral[] {
    const referrals = this.get<Referral>(this.getKey('referrals'));
    if (userId) {
      return referrals.filter(r => r.referrerId === userId || r.refereeId === userId);
    }
    return referrals;
  }

  getReferralByCode(code: string): Referral | null {
    const referrals = this.get<Referral>(this.getKey('referrals'));
    return referrals.find(r => r.code === code) || null;
  }

  createReferral(referralData: Omit<Referral, 'id' | 'createdAt'>): Referral {
    const referrals = this.get<Referral>(this.getKey('referrals'));
    const referral: Referral = {
      ...referralData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    referrals.push(referral);
    this.set(this.getKey('referrals'), referrals);
    return referral;
  }

  updateReferral(id: string, updates: Partial<Referral>): void {
    const referrals = this.get<Referral>(this.getKey('referrals'));
    const index = referrals.findIndex(r => r.id === id);
    if (index >= 0) {
      referrals[index] = { ...referrals[index], ...updates };
      this.set(this.getKey('referrals'), referrals);
    }
  }

  // Verification Queue
  getVerificationQueue(status?: 'pending' | 'approved' | 'rejected'): VerificationQueue[] {
    const queue = this.get<VerificationQueue>(this.getKey('verification_queue'));
    if (status) {
      return queue.filter(q => q.status === status);
    }
    return queue.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createVerificationRequest(requestData: Omit<VerificationQueue, 'id' | 'createdAt'>): VerificationQueue {
    const queue = this.get<VerificationQueue>(this.getKey('verification_queue'));
    const request: VerificationQueue = {
      ...requestData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    queue.push(request);
    this.set(this.getKey('verification_queue'), queue);
    return request;
  }

  updateVerificationRequest(id: string, updates: Partial<VerificationQueue>): void {
    const queue = this.get<VerificationQueue>(this.getKey('verification_queue'));
    const index = queue.findIndex(q => q.id === id);
    if (index >= 0) {
      queue[index] = { 
        ...queue[index], 
        ...updates,
        reviewedAt: updates.status && updates.status !== 'pending' ? new Date().toISOString() : queue[index].reviewedAt
      };
      this.set(this.getKey('verification_queue'), queue);
    }
  }

  // Governance Proposals
  getProposals(status?: string): GovernanceProposal[] {
    const proposals = this.get<GovernanceProposal>(this.getKey('proposals'));
    if (status) {
      return proposals.filter(p => p.status === status);
    }
    return proposals.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createProposal(proposalData: Omit<GovernanceProposal, 'id' | 'createdAt' | 'votesFor' | 'votesAgainst' | 'votesAbstain'>): GovernanceProposal {
    const proposals = this.get<GovernanceProposal>(this.getKey('proposals'));
    const proposal: GovernanceProposal = {
      ...proposalData,
      id: this.generateId(),
      votesFor: 0,
      votesAgainst: 0,
      votesAbstain: 0,
      createdAt: new Date().toISOString(),
    };
    proposals.push(proposal);
    this.set(this.getKey('proposals'), proposals);
    return proposal;
  }

  updateProposal(id: string, updates: Partial<GovernanceProposal>): void {
    const proposals = this.get<GovernanceProposal>(this.getKey('proposals'));
    const index = proposals.findIndex(p => p.id === id);
    if (index >= 0) {
      proposals[index] = { ...proposals[index], ...updates };
      this.set(this.getKey('proposals'), proposals);
    }
  }

  // Votes
  getVotes(proposalId: string): Vote[] {
    const votes = this.get<Vote>(this.getKey('votes'));
    return votes.filter(v => v.proposalId === proposalId);
  }

  getUserVote(proposalId: string, userId: string): Vote | null {
    const votes = this.get<Vote>(this.getKey('votes'));
    return votes.find(v => v.proposalId === proposalId && v.voterId === userId) || null;
  }

  createVote(voteData: Omit<Vote, 'id' | 'createdAt'>): Vote {
    const votes = this.get<Vote>(this.getKey('votes'));
    
    // Check if user already voted
    const existingVote = votes.find(v => 
      v.proposalId === voteData.proposalId && v.voterId === voteData.voterId
    );
    if (existingVote) {
      throw new Error('User has already voted on this proposal');
    }

    const vote: Vote = {
      ...voteData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    votes.push(vote);
    this.set(this.getKey('votes'), votes);

    // Update proposal vote counts
    const proposals = this.get<GovernanceProposal>(this.getKey('proposals'));
    const proposalIndex = proposals.findIndex(p => p.id === voteData.proposalId);
    if (proposalIndex >= 0) {
      if (vote.vote === 'for') proposals[proposalIndex].votesFor += vote.votingPower;
      else if (vote.vote === 'against') proposals[proposalIndex].votesAgainst += vote.votingPower;
      else if (vote.vote === 'abstain') proposals[proposalIndex].votesAbstain += vote.votingPower;
      this.set(this.getKey('proposals'), proposals);
    }

    return vote;
  }

  // Initialize with demo data
  initializeDemoData(): void {
    try {
      // Only initialize if no data exists and prevent double initialization
      const initKey = this.getKey('demo_initialized');
      if (this.get<boolean>(initKey, false)) {
        return; // Already initialized
      }
      
      if (this.getHotspots().length === 0) {
      // Create demo hotspots
      const demoHotspots = [
        {
          name: "Karachi Central Hub",
          location: "Saddar, Karachi",
          latitude: 24.8607,
          longitude: 67.0011,
          status: "online" as const,
          operatorId: "demo-user",
          earnings: 245,
          users: 127,
          uptime: 98.5,
        },
        {
          name: "Lahore University Zone",
          location: "PU Campus, Lahore",
          latitude: 31.5204,
          longitude: 74.3587,
          status: "online" as const,
          operatorId: "demo-user",
          earnings: 189,
          users: 98,
          uptime: 96.2,
        },
        {
          name: "Islamabad Tech Park",
          location: "Blue Area, Islamabad",
          latitude: 33.6844,
          longitude: 73.0479,
          status: "maintenance" as const,
          operatorId: "demo-user",
          earnings: 156,
          users: 67,
          uptime: 89.1,
        }
      ];

      demoHotspots.forEach(hotspot => this.createHotspot(hotspot));
    }

    if (this.getDeliveryPartners().length === 0) {
      // Create demo delivery partners
      const demoPartners = [
        {
          name: "Ahmad Ali",
          email: "ahmad@foodpanda.pk",
          phone: "+92-300-1234567",
          vehicle: "Motorcycle",
          rating: 4.8,
          deliveries: 142,
          earnings: 1250,
          status: "active" as const,
        },
        {
          name: "Fatima Khan",
          email: "fatima@tcs.pk",
          phone: "+92-301-2345678",
          vehicle: "Car",
          rating: 4.9,
          deliveries: 98,
          earnings: 1450,
          status: "active" as const,
        },
        {
          name: "Hassan Sheikh",
          email: "hassan@local.pk",
          phone: "+92-302-3456789",
          vehicle: "Bicycle",
          rating: 4.6,
          deliveries: 76,
          earnings: 890,
          status: "inactive" as const,
        }
      ];

      demoPartners.forEach(partner => this.createDeliveryPartner(partner));
    }

    if (this.getFarms().length === 0) {
      // Create demo farms
      const demoFarms = [
        {
          name: "Green Valley Farm",
          ownerId: "demo-user",
          location: "Sargodha, Punjab",
          size: 25,
          cropType: "Wheat",
          sensors: 8,
          lastUpdate: new Date().toISOString(),
          earnings: 340,
        },
        {
          name: "Sindhi Agriculture Co.",
          ownerId: "demo-user",
          location: "Hyderabad, Sindh",
          size: 40,
          cropType: "Cotton",
          sensors: 12,
          lastUpdate: new Date().toISOString(),
          earnings: 520,
        },
        {
          name: "Mountain View Orchard",
          ownerId: "demo-user",
          location: "Swat, KPK",
          size: 15,
          cropType: "Apple",
          sensors: 6,
          lastUpdate: new Date().toISOString(),
          earnings: 280,
        }
      ];

      demoFarms.forEach(farm => this.createFarm(farm));
    }

    if (this.getHealthcareProviders().length === 0) {
      // Create demo healthcare providers
      const demoProviders = [
        {
          name: "Shaukat Khanum Memorial Cancer Hospital",
          type: "hospital" as const,
          location: "Lahore, Punjab",
          address: "7-A Block R-3 M.A. Johar Town, Lahore",
          license: "PMA-LHR-001234",
          capacity: 200,
          dataPoints: 1240,
          earnings: 620,
          status: "active" as const,
          registeredBy: "demo-user",
        },
        {
          name: "Aga Khan University Hospital",
          type: "hospital" as const,
          location: "Karachi, Sindh",
          address: "Stadium Road, Karachi",
          license: "PMA-KHI-005678",
          capacity: 700,
          dataPoints: 3420,
          earnings: 1710,
          status: "active" as const,
          registeredBy: "demo-user",
        },
        {
          name: "Chughtai Lab",
          type: "diagnostic_center" as const,
          location: "Islamabad, ICT",
          address: "Blue Area, Islamabad",
          license: "PMA-ISB-009876",
          capacity: 500,
          dataPoints: 890,
          earnings: 445,
          status: "active" as const,
          registeredBy: "demo-user",
        }
      ];

      demoProviders.forEach(provider => this.createHealthcareProvider(provider));
    }

    if (this.getTaxCollectionPoints().length === 0) {
      // Create demo tax collection points
      const demoTaxPoints = [
        {
          name: "FBR Regional Tax Office",
          type: "fbr_office" as const,
          location: "Karachi, Sindh",
          address: "I.I. Chundrigar Road, Karachi",
          jurisdiction: "Karachi Zone",
          transactionsLogged: 5670,
          dataPoints: 2835,
          earnings: 1418,
          status: "active" as const,
          registeredBy: "demo-user",
        },
        {
          name: "Punjab Revenue Authority",
          type: "provincial_office" as const,
          location: "Lahore, Punjab",
          address: "Civil Secretariat, Lahore",
          jurisdiction: "Punjab Province",
          transactionsLogged: 4320,
          dataPoints: 2160,
          earnings: 1080,
          status: "active" as const,
          registeredBy: "demo-user",
        },
        {
          name: "Customs House",
          type: "customs_office" as const,
          location: "Karachi Port, Sindh",
          address: "Port Qasim, Karachi",
          jurisdiction: "Karachi Port Authority",
          transactionsLogged: 3240,
          dataPoints: 1620,
          earnings: 810,
          status: "active" as const,
          registeredBy: "demo-user",
        }
      ];

      demoTaxPoints.forEach(point => this.createTaxCollectionPoint(point));
    }
    
    // Mark as initialized
    this.set(initKey, true);
    } catch (error) {
      console.error('Failed to initialize demo data:', error);
    }
  }

  // EV Charging / Power Sector Methods
  getChargingPlots(): ChargingPlot[] {
    return this.get<ChargingPlot>(this.getKey('charging_plots'));
  }

  createChargingPlot(plotData: Omit<ChargingPlot, 'id'>): ChargingPlot {
    const plots = this.getChargingPlots();
    const plot: ChargingPlot = {
      ...plotData,
      id: this.generateId(),
    };
    plots.push(plot);
    this.set(this.getKey('charging_plots'), plots);
    return plot;
  }

  updateChargingPlot(id: string, updates: Partial<ChargingPlot>): ChargingPlot | null {
    const plots = this.getChargingPlots();
    const index = plots.findIndex(p => p.id === id);
    if (index >= 0) {
      plots[index] = { ...plots[index], ...updates };
      this.set(this.getKey('charging_plots'), plots);
      return plots[index];
    }
    return null;
  }

  getPlotListings(): PlotListing[] {
    return this.get<PlotListing>(this.getKey('plot_listings'));
  }

  createPlotListing(listingData: Omit<PlotListing, 'id'>): PlotListing {
    const listings = this.getPlotListings();
    const listing: PlotListing = {
      ...listingData,
      id: this.generateId(),
    };
    listings.push(listing);
    this.set(this.getKey('plot_listings'), listings);
    return listing;
  }

  updatePlotListing(id: string, updates: Partial<PlotListing>): PlotListing | null {
    const listings = this.getPlotListings();
    const index = listings.findIndex(l => l.id === id);
    if (index >= 0) {
      listings[index] = { ...listings[index], ...updates };
      this.set(this.getKey('plot_listings'), listings);
      return listings[index];
    }
    return null;
  }

  removePlotListing(id: string): boolean {
    const listings = this.getPlotListings();
    const index = listings.findIndex(l => l.id === id);
    if (index >= 0) {
      listings.splice(index, 1);
      this.set(this.getKey('plot_listings'), listings);
      return true;
    }
    return false;
  }

  getEVChargers(): EVCharger[] {
    return this.get<EVCharger>(this.getKey('ev_chargers'));
  }

  createEVCharger(chargerData: Omit<EVCharger, 'id'>): EVCharger {
    const chargers = this.getEVChargers();
    const charger: EVCharger = {
      ...chargerData,
      id: this.generateId(),
    };
    chargers.push(charger);
    this.set(this.getKey('ev_chargers'), chargers);
    return charger;
  }

  updateEVCharger(id: string, updates: Partial<EVCharger>): EVCharger | null {
    const chargers = this.getEVChargers();
    const index = chargers.findIndex(c => c.id === id);
    if (index >= 0) {
      chargers[index] = { ...chargers[index], ...updates };
      this.set(this.getKey('ev_chargers'), chargers);
      return chargers[index];
    }
    return null;
  }

  getChargingSessions(userId?: string): ChargingSession[] {
    const sessions = this.get<ChargingSession>(this.getKey('charging_sessions'));
    if (userId) {
      return sessions.filter(s => s.userId === userId);
    }
    return sessions;
  }

  getActiveChargingSessions(): ChargingSession[] {
    const sessions = this.get<ChargingSession>(this.getKey('charging_sessions'));
    return sessions.filter(s => s.status === 'active');
  }

  createChargingSession(sessionData: Omit<ChargingSession, 'id'>): ChargingSession {
    const sessions = this.get<ChargingSession>(this.getKey('charging_sessions'));
    const session: ChargingSession = {
      ...sessionData,
      id: this.generateId(),
    };
    sessions.push(session);
    this.set(this.getKey('charging_sessions'), sessions);
    return session;
  }

  updateChargingSession(id: string, updates: Partial<ChargingSession>): ChargingSession | null {
    const sessions = this.get<ChargingSession>(this.getKey('charging_sessions'));
    const index = sessions.findIndex(s => s.id === id);
    if (index >= 0) {
      sessions[index] = { ...sessions[index], ...updates };
      this.set(this.getKey('charging_sessions'), sessions);
      return sessions[index];
    }
    return null;
  }

  getChargingPoints(userId: string): ChargingPoints {
    const allPoints = this.get<ChargingPoints>(this.getKey('charging_points'));
    const existing = allPoints.find(p => p.userId === userId);
    
    if (existing) {
      return existing;
    }

    // Create default points for new user
    const newPoints: ChargingPoints = {
      userId,
      points: 0,
      earned: 0,
      traded: 0,
      lastUpdated: new Date().toISOString(),
    };
    
    allPoints.push(newPoints);
    this.set(this.getKey('charging_points'), allPoints);
    return newPoints;
  }

  updateChargingPoints(userId: string, updates: Partial<ChargingPoints>): void {
    const allPoints = this.get<ChargingPoints>(this.getKey('charging_points'));
    const index = allPoints.findIndex(p => p.userId === userId);
    
    if (index >= 0) {
      allPoints[index] = { ...allPoints[index], ...updates, lastUpdated: new Date().toISOString() };
    } else {
      allPoints.push({
        userId,
        points: updates.points || 0,
        earned: updates.earned || 0,
        traded: updates.traded || 0,
        lastUpdated: new Date().toISOString(),
      });
    }
    
    this.set(this.getKey('charging_points'), allPoints);
    
    // Notify UI components
    window.dispatchEvent(new CustomEvent('chargingPointsUpdated', { 
      detail: { userId, points: allPoints[index >= 0 ? index : allPoints.length - 1] } 
    }));
  }

  getPointTransactions(userId?: string, type?: 'buy' | 'sell'): PointTransaction[] {
    let transactions = this.get<PointTransaction>(this.getKey('point_transactions'));
    
    if (userId) {
      transactions = transactions.filter(t => t.from === userId || t.to === userId);
    }
    
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }
    
    return transactions;
  }

  createPointTransaction(transactionData: Omit<PointTransaction, 'id'>): PointTransaction {
    const transactions = this.get<PointTransaction>(this.getKey('point_transactions'));
    const transaction: PointTransaction = {
      ...transactionData,
      id: this.generateId(),
    };
    transactions.push(transaction);
    this.set(this.getKey('point_transactions'), transactions);
    return transaction;
  }

  // Marketplace Listings
  getMarketplaceListings(status?: 'active' | 'sold' | 'cancelled'): MarketplaceListing[] {
    let listings = this.get<MarketplaceListing>(this.getKey('marketplace_listings'));
    
    if (status) {
      listings = listings.filter(l => l.status === status);
    }
    
    return listings;
  }

  createMarketplaceListing(listingData: Omit<MarketplaceListing, 'id'>): MarketplaceListing {
    const listings = this.get<MarketplaceListing>(this.getKey('marketplace_listings'));
    const listing: MarketplaceListing = {
      ...listingData,
      id: this.generateId(),
    };
    listings.push(listing);
    this.set(this.getKey('marketplace_listings'), listings);
    return listing;
  }

  updateMarketplaceListing(id: string, updates: Partial<MarketplaceListing>): MarketplaceListing | null {
    const listings = this.get<MarketplaceListing>(this.getKey('marketplace_listings'));
    const index = listings.findIndex(l => l.id === id);
    if (index >= 0) {
      listings[index] = { ...listings[index], ...updates };
      this.set(this.getKey('marketplace_listings'), listings);
      return listings[index];
    }
    return null;
  }

  deleteMarketplaceListing(id: string): boolean {
    const listings = this.get<MarketplaceListing>(this.getKey('marketplace_listings'));
    const filtered = listings.filter(l => l.id !== id);
    if (filtered.length < listings.length) {
      this.set(this.getKey('marketplace_listings'), filtered);
      return true;
    }
    return false;
  }
}

export const localDb = new LocalDatabase();