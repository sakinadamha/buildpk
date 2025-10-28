import { localDb } from './localDb';

class LocalApiClient {
  private authToken: string | null = null;
  private currentUserId: string | null = null;

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  setCurrentUserId(userId: string | null) {
    this.currentUserId = userId;
  }

  private async simulateApiDelay() {
    // Simulate network delay for realistic experience - reduced for better performance
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
  }

  // WiFi Network API
  async getHotspots() {
    await this.simulateApiDelay();
    return localDb.getHotspots();
  }

  async createHotspot(hotspotData: any) {
    await this.simulateApiDelay();
    
    const hotspot = localDb.createHotspot({
      ...hotspotData,
      operatorId: hotspotData.operatorId || this.currentUserId || 'pending-verification',
      earnings: 0,
      users: 0,
      uptime: 0,
    });

    // Award tokens for creating hotspot if user is authenticated
    if (this.currentUserId) {
      const balance = localDb.getTokenBalance(this.currentUserId);
      localDb.updateTokenBalance(this.currentUserId, {
        tokens: balance.tokens + 50
      });

      localDb.createTransaction(this.currentUserId, {
        type: 'earned',
        amount: 50,
        description: `Hotspot deployment reward: ${hotspot.name}`
      });
    }

    return hotspot;
  }

  async updateHotspotStatus(hotspotId: string, statusData: any) {
    await this.simulateApiDelay();
    localDb.updateHotspot(hotspotId, statusData);
    return { success: true };
  }

  // Logistics API
  async getDeliveryPartners() {
    await this.simulateApiDelay();
    return localDb.getDeliveryPartners();
  }

  async createDeliveryPartner(partnerData: any) {
    await this.simulateApiDelay();
    const partner = localDb.createDeliveryPartner({
      ...partnerData,
      rating: 0,
      deliveries: 0,
      earnings: 0,
      status: partnerData.status || 'inactive',
    });

    // Award tokens for partner registration if user is authenticated
    if (this.currentUserId) {
      const balance = localDb.getTokenBalance(this.currentUserId);
      localDb.updateTokenBalance(this.currentUserId, {
        tokens: balance.tokens + 25
      });

      localDb.createTransaction(this.currentUserId, {
        type: 'earned',
        amount: 25,
        description: `Delivery partner registration: ${partner.name}`
      });
    }

    return partner;
  }

  async recordDelivery(deliveryData: any) {
    await this.simulateApiDelay();
    
    // Award tokens for delivery data
    if (this.currentUserId) {
      const balance = localDb.getTokenBalance(this.currentUserId);
      localDb.updateTokenBalance(this.currentUserId, {
        tokens: balance.tokens + 5
      });

      localDb.createTransaction(this.currentUserId, {
        type: 'earned',
        amount: 5,
        description: 'Delivery route data contribution'
      });
    }

    return { success: true, deliveryId: localDb.generateId() };
  }

  // Agriculture API
  async getFarms() {
    await this.simulateApiDelay();
    return localDb.getFarms();
  }

  async createFarm(farmData: any) {
    await this.simulateApiDelay();
    
    const farm = localDb.createFarm({
      ...farmData,
      ownerId: farmData.ownerId || this.currentUserId || 'pending-verification',
      sensors: farmData.sensors || 0,
      lastUpdate: new Date().toISOString(),
      earnings: 0,
    });

    // Award tokens for farm registration if user is authenticated
    if (this.currentUserId) {
      const balance = localDb.getTokenBalance(this.currentUserId);
      localDb.updateTokenBalance(this.currentUserId, {
        tokens: balance.tokens + 75
      });

      localDb.createTransaction(this.currentUserId, {
        type: 'earned',
        amount: 75,
        description: `Farm registration: ${farm.name}`
      });
    }

    return farm;
  }

  async recordSensorData(sensorData: any) {
    await this.simulateApiDelay();
    
    // Award tokens for sensor data
    if (this.currentUserId) {
      const balance = localDb.getTokenBalance(this.currentUserId);
      localDb.updateTokenBalance(this.currentUserId, {
        tokens: balance.tokens + 2
      });

      localDb.createTransaction(this.currentUserId, {
        type: 'earned',
        amount: 2,
        description: 'Agricultural sensor data contribution'
      });
    }

    return { success: true };
  }

  // Healthcare API
  async getHealthcareProviders() {
    await this.simulateApiDelay();
    return localDb.getHealthcareProviders();
  }

  async createHealthcareProvider(providerData: any) {
    await this.simulateApiDelay();
    
    const provider = localDb.createHealthcareProvider({
      ...providerData,
      registeredBy: providerData.registeredBy || this.currentUserId || 'pending-verification',
      dataPoints: 0,
      earnings: 0,
      status: providerData.status || 'pending',
    });

    // Award tokens for healthcare provider registration
    if (this.currentUserId) {
      const balance = localDb.getTokenBalance(this.currentUserId);
      localDb.updateTokenBalance(this.currentUserId, {
        tokens: balance.tokens + 100
      });

      localDb.createTransaction(this.currentUserId, {
        type: 'earned',
        amount: 100,
        description: `Healthcare provider registration: ${provider.name}`
      });
    }

    return provider;
  }

  async recordHealthcareData(healthData: any) {
    await this.simulateApiDelay();
    
    // Award tokens for healthcare data contribution
    if (this.currentUserId) {
      const balance = localDb.getTokenBalance(this.currentUserId);
      localDb.updateTokenBalance(this.currentUserId, {
        tokens: balance.tokens + 10
      });

      localDb.createTransaction(this.currentUserId, {
        type: 'earned',
        amount: 10,
        description: 'Anonymized healthcare data contribution'
      });
    }

    return { success: true };
  }

  // Taxation API
  async getTaxCollectionPoints() {
    await this.simulateApiDelay();
    return localDb.getTaxCollectionPoints();
  }

  async createTaxCollectionPoint(pointData: any) {
    await this.simulateApiDelay();
    
    const point = localDb.createTaxCollectionPoint({
      ...pointData,
      registeredBy: pointData.registeredBy || this.currentUserId || 'pending-verification',
      transactionsLogged: 0,
      dataPoints: 0,
      earnings: 0,
      status: pointData.status || 'inactive',
    });

    // Award tokens for tax collection point registration
    if (this.currentUserId) {
      const balance = localDb.getTokenBalance(this.currentUserId);
      localDb.updateTokenBalance(this.currentUserId, {
        tokens: balance.tokens + 150
      });

      localDb.createTransaction(this.currentUserId, {
        type: 'earned',
        amount: 150,
        description: `Tax collection point registration: ${point.name}`
      });
    }

    return point;
  }

  async recordTaxData(taxData: any) {
    await this.simulateApiDelay();
    
    // Award tokens for tax transaction data
    if (this.currentUserId) {
      const balance = localDb.getTokenBalance(this.currentUserId);
      localDb.updateTokenBalance(this.currentUserId, {
        tokens: balance.tokens + 15
      });

      localDb.createTransaction(this.currentUserId, {
        type: 'earned',
        amount: 15,
        description: 'Tax transaction data contribution'
      });
    }

    return { success: true };
  }

  // Token Economics API
  async getTokenBalance(userId: string) {
    await this.simulateApiDelay();
    return localDb.getTokenBalance(userId);
  }

  async getTransactions(userId: string) {
    await this.simulateApiDelay();
    return localDb.getTransactions(userId);
  }

  async stakeTokens(stakeData: any) {
    await this.simulateApiDelay();
    if (!this.currentUserId) {
      throw new Error('Authentication required');
    }

    const balance = localDb.getTokenBalance(this.currentUserId);
    const { amount } = stakeData;

    if (balance.tokens < amount) {
      throw new Error('Insufficient tokens for staking');
    }

    localDb.updateTokenBalance(this.currentUserId, {
      tokens: balance.tokens - amount,
      staked: balance.staked + amount
    });

    localDb.createTransaction(this.currentUserId, {
      type: 'staked',
      amount,
      description: 'Tokens staked for network rewards'
    });

    return { success: true };
  }

  async unstakeTokens(unstakeData: any) {
    await this.simulateApiDelay();
    if (!this.currentUserId) {
      throw new Error('Authentication required');
    }

    const balance = localDb.getTokenBalance(this.currentUserId);
    const { amount } = unstakeData;

    if (balance.staked < amount) {
      throw new Error('Insufficient staked tokens for unstaking');
    }

    localDb.updateTokenBalance(this.currentUserId, {
      tokens: balance.tokens + amount,
      staked: balance.staked - amount
    });

    localDb.createTransaction(this.currentUserId, {
      type: 'unstaked',
      amount,
      description: 'Tokens unstaked from network pools'
    });

    return { success: true };
  }

  async claimRewards(rewardData: any) {
    await this.simulateApiDelay();
    if (!this.currentUserId) {
      throw new Error('Authentication required');
    }

    // For demo purposes, calculate a small reward amount
    const rewardAmount = Math.floor(Math.random() * 20) + 5; // 5-25 tokens

    const balance = localDb.getTokenBalance(this.currentUserId);
    localDb.updateTokenBalance(this.currentUserId, {
      tokens: balance.tokens + rewardAmount
    });

    localDb.createTransaction(this.currentUserId, {
      type: 'earned',
      amount: rewardAmount,
      description: 'Staking pool rewards claimed'
    });

    return { success: true, amount: rewardAmount };
  }

  // Power/EV Charging API
  async getChargingPlots() {
    await this.simulateApiDelay();
    return localDb.getChargingPlots();
  }

  async purchasePlot(plotId: string) {
    await this.simulateApiDelay();
    if (!this.currentUserId) {
      throw new Error('Authentication required');
    }

    const plot = localDb.getChargingPlots().find(p => p.id === plotId);
    if (!plot) throw new Error('Plot not found');
    if (plot.status !== 'available') throw new Error('Plot not available');

    const balance = localDb.getTokenBalance(this.currentUserId);
    if (balance.tokens < plot.price) {
      throw new Error('Insufficient BUILD tokens');
    }

    // Deduct tokens
    localDb.updateTokenBalance(this.currentUserId, {
      tokens: balance.tokens - plot.price
    });

    // Update plot ownership
    localDb.updateChargingPlot(plotId, {
      ownerId: this.currentUserId,
      status: 'occupied',
      purchasedAt: new Date().toISOString()
    });

    // Record transaction
    localDb.createTransaction(this.currentUserId, {
      type: 'transferred',
      amount: -plot.price,
      description: `Purchased charging plot: ${plot.location}`
    });

    return { success: true, plot };
  }

  async sellPlot(plotId: string, salePrice: number) {
    await this.simulateApiDelay();
    if (!this.currentUserId) {
      throw new Error('Authentication required');
    }

    const plot = localDb.getChargingPlots().find(p => p.id === plotId);
    if (!plot) throw new Error('Plot not found');
    if (plot.ownerId !== this.currentUserId) throw new Error('You do not own this plot');
    if (plot.status !== 'occupied') throw new Error('Plot is not available for sale');

    const existingListing = localDb.getPlotListings().find(l => l.plotId === plotId && l.status === 'active');
    if (existingListing) {
      throw new Error('This plot is already listed for sale');
    }

    const user = localDb.getUser(this.currentUserId);
    if (!user) throw new Error('User not found');

    const listing = localDb.createPlotListing({
      plotId: plot.id,
      sellerId: this.currentUserId,
      sellerName: user.walletAddress.slice(0, 8) + '...',
      location: plot.location,
      city: plot.city,
      originalPrice: plot.price,
      salePrice: salePrice,
      listedAt: new Date().toISOString(),
      status: 'active'
    });

    localDb.updateChargingPlot(plotId, {
      status: 'reserved'
    });

    return { success: true, listing };
  }

  async getPlotListings() {
    await this.simulateApiDelay();
    return localDb.getPlotListings().filter(l => l.status === 'active');
  }

  async buyPlotFromListing(listingId: string) {
    await this.simulateApiDelay();
    if (!this.currentUserId) {
      throw new Error('Authentication required');
    }

    const listing = localDb.getPlotListings().find(l => l.id === listingId);
    if (!listing) throw new Error('Listing not found');
    if (listing.status !== 'active') throw new Error('Listing is not active');
    if (listing.sellerId === this.currentUserId) throw new Error('You cannot buy your own listing');

    const plot = localDb.getChargingPlots().find(p => p.id === listing.plotId);
    if (!plot) throw new Error('Plot not found');

    const balance = localDb.getTokenBalance(this.currentUserId);
    if (balance.tokens < listing.salePrice) {
      throw new Error('Insufficient BUILD tokens');
    }

    localDb.updateTokenBalance(this.currentUserId, {
      tokens: balance.tokens - listing.salePrice
    });

    const sellerBalance = localDb.getTokenBalance(listing.sellerId);
    localDb.updateTokenBalance(listing.sellerId, {
      tokens: sellerBalance.tokens + listing.salePrice
    });

    localDb.updateChargingPlot(listing.plotId, {
      ownerId: this.currentUserId,
      status: 'occupied',
      purchasedAt: new Date().toISOString()
    });

    localDb.updatePlotListing(listingId, {
      status: 'sold'
    });

    localDb.createTransaction(this.currentUserId, {
      type: 'transferred',
      amount: -listing.salePrice,
      description: `Purchased plot from marketplace: ${plot.location}`
    });

    localDb.createTransaction(listing.sellerId, {
      type: 'earned',
      amount: listing.salePrice,
      description: `Sold plot on marketplace: ${plot.location}`
    });

    return { success: true, plot };
  }

  async cancelPlotListing(listingId: string) {
    await this.simulateApiDelay();
    if (!this.currentUserId) {
      throw new Error('Authentication required');
    }

    const listing = localDb.getPlotListings().find(l => l.id === listingId);
    if (!listing) throw new Error('Listing not found');
    if (listing.sellerId !== this.currentUserId) throw new Error('You do not own this listing');
    if (listing.status !== 'active') throw new Error('Listing is not active');

    localDb.updatePlotListing(listingId, {
      status: 'cancelled'
    });

    localDb.updateChargingPlot(listing.plotId, {
      status: 'occupied'
    });

    return { success: true };
  }

  async getEVChargers(userId?: string) {
    await this.simulateApiDelay();
    const chargers = localDb.getEVChargers();
    if (userId) {
      return chargers.filter(c => c.ownerId === userId);
    }
    return chargers;
  }

  async installCharger(chargerData: any) {
    await this.simulateApiDelay();
    if (!this.currentUserId) {
      throw new Error('Authentication required');
    }

    const plot = localDb.getChargingPlots().find(p => p.id === chargerData.plotId);
    if (!plot) throw new Error('Plot not found');
    if (plot.ownerId !== this.currentUserId) throw new Error('You do not own this plot');

    const balance = localDb.getTokenBalance(this.currentUserId);
    if (balance.tokens < chargerData.installCost) {
      throw new Error('Insufficient BUILD tokens for installation');
    }

    // Deduct installation cost
    localDb.updateTokenBalance(this.currentUserId, {
      tokens: balance.tokens - chargerData.installCost
    });

    // Create charger
    const charger = localDb.createEVCharger({
      ...chargerData,
      ownerId: this.currentUserId,
      totalSessions: 0,
      totalEnergy: 0,
      earnings: 0,
      installedAt: new Date().toISOString()
    });

    // Record transaction
    localDb.createTransaction(this.currentUserId, {
      type: 'transferred',
      amount: -chargerData.installCost,
      description: `Installed ${chargerData.type} charger: ${chargerData.name}`
    });

    return charger;
  }

  async getChargingSessions(userId?: string) {
    await this.simulateApiDelay();
    return localDb.getChargingSessions(userId);
  }

  async getActiveChargingSessions() {
    await this.simulateApiDelay();
    return localDb.getActiveChargingSessions();
  }

  async startChargingSession(sessionData: any) {
    await this.simulateApiDelay();
    if (!this.currentUserId) {
      throw new Error('Authentication required');
    }

    const charger = localDb.getEVChargers().find(c => c.id === sessionData.chargerId);
    if (!charger) throw new Error('Charger not found');
    if (charger.status !== 'online') throw new Error('Charger is not available');

    // Create charging session
    const session = localDb.createChargingSession({
      chargerId: sessionData.chargerId,
      userId: this.currentUserId,
      vehicleType: sessionData.vehicleType,
      startTime: new Date().toISOString(),
      energyUsed: 0,
      duration: 0,
      cost: 0,
      pointsEarned: 0,
      paymentMethod: sessionData.paymentMethod || 'fiat',
      status: 'active'
    });

    // Update charger status
    localDb.updateEVCharger(sessionData.chargerId, { status: 'charging' });

    return session;
  }

  async endChargingSession(sessionId: string, energyUsed: number) {
    await this.simulateApiDelay();
    if (!this.currentUserId) {
      throw new Error('Authentication required');
    }

    const session = localDb.getChargingSessions().find(s => s.id === sessionId);
    if (!session) throw new Error('Session not found');
    if (session.userId !== this.currentUserId) throw new Error('Unauthorized');

    const charger = localDb.getEVChargers().find(c => c.id === session.chargerId);
    if (!charger) throw new Error('Charger not found');

    const startTime = new Date(session.startTime).getTime();
    const endTime = Date.now();
    const duration = Math.floor((endTime - startTime) / 1000); // seconds

    // Calculate cost and points
    let cost = 0;
    if (charger.pricing.model === 'per_kwh') {
      cost = energyUsed * (charger.pricing.perKwh || 0);
    } else {
      cost = duration * (charger.pricing.perSecond || 0);
    }

    const pointsEarned = Math.floor(energyUsed * 10); // 10 points per kWh

    // Update session
    localDb.updateChargingSession(sessionId, {
      endTime: new Date().toISOString(),
      energyUsed,
      duration,
      cost,
      pointsEarned,
      status: 'completed'
    });

    // Update charger
    localDb.updateEVCharger(session.chargerId, {
      status: 'online',
      totalSessions: charger.totalSessions + 1,
      totalEnergy: charger.totalEnergy + energyUsed,
      earnings: charger.earnings + cost
    });

    // Award points to driver
    const currentPoints = localDb.getChargingPoints(this.currentUserId);
    localDb.updateChargingPoints(this.currentUserId, {
      points: currentPoints.points + pointsEarned,
      earned: currentPoints.earned + pointsEarned
    });

    // Award BUILD tokens to charger owner
    const ownerBalance = localDb.getTokenBalance(charger.ownerId);
    const buildReward = Math.floor(energyUsed * 0.5); // 0.5 BUILD per kWh
    localDb.updateTokenBalance(charger.ownerId, {
      tokens: ownerBalance.tokens + buildReward
    });

    localDb.createTransaction(charger.ownerId, {
      type: 'earned',
      amount: buildReward,
      description: `Charging session revenue: ${energyUsed.toFixed(2)} kWh`
    });

    return { success: true, session, pointsEarned, buildReward };
  }

  async getChargingPoints(userId: string) {
    await this.simulateApiDelay();
    return localDb.getChargingPoints(userId);
  }

  async getPointTransactions(userId?: string) {
    await this.simulateApiDelay();
    return localDb.getPointTransactions(userId);
  }

  async getMarketplaceListings() {
    await this.simulateApiDelay();
    return localDb.getMarketplaceListings('active');
  }

  async createMarketplaceListing(listingData: any) {
    await this.simulateApiDelay();
    if (!this.currentUserId) {
      throw new Error('Authentication required');
    }

    const userPoints = localDb.getChargingPoints(this.currentUserId);
    if (userPoints.points < listingData.points) {
      throw new Error('Insufficient points to list');
    }

    const user = localDb.getUserById(this.currentUserId);
    const listing = localDb.createMarketplaceListing({
      sellerId: this.currentUserId,
      sellerName: user?.name || 'Anonymous',
      points: listingData.points,
      buildTokens: listingData.buildTokens,
      discount: listingData.discount,
      regularPrice: listingData.regularPrice,
      location: listingData.location || 'Pakistan',
      status: 'active',
      createdAt: new Date().toISOString()
    });

    return listing;
  }

  async buyPoints(listingId: string, pointsToBuy: number) {
    await this.simulateApiDelay();
    if (!this.currentUserId) {
      throw new Error('Authentication required');
    }

    const listing = localDb.getMarketplaceListings('active').find(l => l.id === listingId);
    if (!listing) {
      throw new Error('Listing not found or no longer available');
    }

    if (pointsToBuy > listing.points) {
      throw new Error('Not enough points available in this listing');
    }

    const cost = Math.ceil((pointsToBuy / listing.points) * listing.buildTokens);

    const buyerBalance = localDb.getTokenBalance(this.currentUserId);
    if (buyerBalance.tokens < cost) {
      throw new Error('Insufficient BUILD tokens');
    }

    // Transfer BUILD tokens
    localDb.updateTokenBalance(this.currentUserId, {
      tokens: buyerBalance.tokens - cost
    });

    const sellerBalance = localDb.getTokenBalance(listing.sellerId);
    localDb.updateTokenBalance(listing.sellerId, {
      tokens: sellerBalance.tokens + cost
    });

    // Transfer points
    const sellerPoints = localDb.getChargingPoints(listing.sellerId);
    localDb.updateChargingPoints(listing.sellerId, {
      points: sellerPoints.points - pointsToBuy,
      traded: sellerPoints.traded + pointsToBuy
    });

    const buyerPoints = localDb.getChargingPoints(this.currentUserId);
    localDb.updateChargingPoints(this.currentUserId, {
      points: buyerPoints.points + pointsToBuy,
      traded: buyerPoints.traded + pointsToBuy
    });

    // Update or remove listing
    if (pointsToBuy >= listing.points) {
      localDb.updateMarketplaceListing(listingId, { status: 'sold' });
    } else {
      localDb.updateMarketplaceListing(listingId, {
        points: listing.points - pointsToBuy,
        buildTokens: Math.ceil(listing.buildTokens * ((listing.points - pointsToBuy) / listing.points))
      });
    }

    // Record transaction
    const transaction = localDb.createPointTransaction({
      from: this.currentUserId,
      to: listing.sellerId,
      points: pointsToBuy,
      buildTokens: cost,
      discount: listing.discount,
      type: 'buy',
      timestamp: new Date().toISOString()
    });

    return { success: true, transaction };
  }

  // Health check with timeout protection
  async healthCheck() {
    try {
      // Very quick health check - no delay needed
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      throw new Error('Health check failed');
    }
  }
}

export const localApiClient = new LocalApiClient();