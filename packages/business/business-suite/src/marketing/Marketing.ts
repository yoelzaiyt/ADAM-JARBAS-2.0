import type {
  Campaign,
  SocialMediaPost,
  CampaignStatus,
  CampaignMetrics,
  SocialMetrics,
  BusinessSuiteConfig,
} from '../interfaces.js';

class DefaultLogger {
  private context: string;
  constructor(context: string) { this.context = context; }
  async debug(msg: string, data?: unknown) { console.debug(`[${this.context}] DEBUG`, msg, data ?? ''); }
  async info(msg: string, data?: unknown) { console.log(`[${this.context}] INFO`, msg, data ?? ''); }
  async warn(msg: string, data?: unknown) { console.warn(`[${this.context}] WARN`, msg, data ?? ''); }
  async error(msg: string, data?: unknown) { console.error(`[${this.context}] ERROR`, msg, data ?? ''); }
}

export interface MarketingConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export interface CampaignROI {
  campaignId: string;
  name: string;
  budget: number;
  spent: number;
  revenue: number;
  roi: number;
  costPerLead: number;
  costPerConversion: number;
}

export interface MarketingDashboard {
  totalCampaigns: number;
  activeCampaigns: number;
  totalBudget: number;
  totalSpent: number;
  totalRevenue: number;
  overallROI: number;
  totalPosts: number;
  publishedPosts: number;
  totalEngagement: number;
}

export class Marketing {
  private logger = new DefaultLogger('marketing');
  private campaigns = new Map<string, Campaign>();
  private posts = new Map<string, SocialMediaPost>();
  private config: MarketingConfig;

  constructor(config?: MarketingConfig) {
    this.config = config ?? {};
  }

  // ─── Campaign ──────────────────────────────────────────────────────────────

  async createCampaign(data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>): Promise<Campaign> {
    const now = new Date();
    const campaign: Campaign = {
      ...data,
      id: crypto.randomUUID(),
      metrics: { impressions: 0, clicks: 0, conversions: 0, leads: 0, revenue: 0, roi: 0 },
      createdAt: now,
      updatedAt: now,
    };
    this.campaigns.set(campaign.id, campaign);
    await this.logger.info('Campaign created', { id: campaign.id, name: campaign.name });
    return campaign;
  }

  async getCampaignById(id: string): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async listCampaigns(companyId: string, filters?: { status?: CampaignStatus; type?: Campaign['type'] }): Promise<Campaign[]> {
    let results = Array.from(this.campaigns.values()).filter(c => c.companyId === companyId);
    if (filters?.status) results = results.filter(c => c.status === filters.status);
    if (filters?.type) results = results.filter(c => c.type === filters.type);
    return results;
  }

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
    const existing = this.campaigns.get(id);
    if (!existing) throw new Error(`Campaign ${id} not found`);
    const updated: Campaign = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.campaigns.set(id, updated);
    await this.logger.info('Campaign updated', { id });
    return updated;
  }

  async deleteCampaign(id: string): Promise<boolean> {
    const deleted = this.campaigns.delete(id);
    if (deleted) await this.logger.info('Campaign deleted', { id });
    return deleted;
  }

  async startCampaign(id: string): Promise<Campaign> {
    const campaign = this.campaigns.get(id);
    if (!campaign) throw new Error(`Campaign ${id} not found`);
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      throw new Error(`Campaign ${id} cannot be started from status ${campaign.status}`);
    }
    campaign.status = 'active';
    campaign.startDate = campaign.startDate ?? new Date();
    campaign.updatedAt = new Date();
    this.campaigns.set(id, campaign);
    await this.logger.info('Campaign started', { id });
    return campaign;
  }

  async pauseCampaign(id: string): Promise<Campaign> {
    const campaign = this.campaigns.get(id);
    if (!campaign) throw new Error(`Campaign ${id} not found`);
    if (campaign.status !== 'active') throw new Error(`Campaign ${id} is not active`);
    campaign.status = 'paused';
    campaign.updatedAt = new Date();
    this.campaigns.set(id, campaign);
    await this.logger.info('Campaign paused', { id });
    return campaign;
  }

  async completeCampaign(id: string): Promise<Campaign> {
    const campaign = this.campaigns.get(id);
    if (!campaign) throw new Error(`Campaign ${id} not found`);
    campaign.status = 'completed';
    campaign.endDate = new Date();
    campaign.updatedAt = new Date();
    this.campaigns.set(id, campaign);
    await this.logger.info('Campaign completed', { id });
    return campaign;
  }

  async cancelCampaign(id: string): Promise<Campaign> {
    const campaign = this.campaigns.get(id);
    if (!campaign) throw new Error(`Campaign ${id} not found`);
    campaign.status = 'cancelled';
    campaign.updatedAt = new Date();
    this.campaigns.set(id, campaign);
    await this.logger.info('Campaign cancelled', { id });
    return campaign;
  }

  async updateCampaignMetrics(id: string, metrics: Partial<CampaignMetrics>): Promise<Campaign> {
    const campaign = this.campaigns.get(id);
    if (!campaign) throw new Error(`Campaign ${id} not found`);
    campaign.metrics = { ...campaign.metrics, ...metrics };
    if (campaign.spent > 0) {
      campaign.metrics.roi = ((campaign.metrics.revenue - campaign.spent) / campaign.spent) * 100;
    }
    campaign.updatedAt = new Date();
    this.campaigns.set(id, campaign);
    await this.logger.info('Campaign metrics updated', { id });
    return campaign;
  }

  async getCampaignROI(id: string): Promise<CampaignROI | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;
    return {
      campaignId: campaign.id,
      name: campaign.name,
      budget: campaign.budget ?? 0,
      spent: campaign.spent,
      revenue: campaign.metrics.revenue,
      roi: campaign.metrics.roi,
      costPerLead: campaign.metrics.leads > 0 ? campaign.spent / campaign.metrics.leads : 0,
      costPerConversion: campaign.metrics.conversions > 0 ? campaign.spent / campaign.metrics.conversions : 0,
    };
  }

  // ─── SocialMediaPost ───────────────────────────────────────────────────────

  async createPost(data: Omit<SocialMediaPost, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>): Promise<SocialMediaPost> {
    const now = new Date();
    const post: SocialMediaPost = {
      ...data,
      id: crypto.randomUUID(),
      metrics: { likes: 0, comments: 0, shares: 0, reach: 0, engagement: 0 },
      createdAt: now,
      updatedAt: now,
    };
    this.posts.set(post.id, post);
    await this.logger.info('Social media post created', { id: post.id, platform: post.platform });
    return post;
  }

  async getPostById(id: string): Promise<SocialMediaPost | undefined> {
    return this.posts.get(id);
  }

  async listPosts(companyId: string, filters?: { campaignId?: string; platform?: SocialMediaPost['platform']; status?: SocialMediaPost['status'] }): Promise<SocialMediaPost[]> {
    let results = Array.from(this.posts.values()).filter(p => p.companyId === companyId);
    if (filters?.campaignId) results = results.filter(p => p.campaignId === filters.campaignId);
    if (filters?.platform) results = results.filter(p => p.platform === filters.platform);
    if (filters?.status) results = results.filter(p => p.status === filters.status);
    return results;
  }

  async updatePost(id: string, data: Partial<SocialMediaPost>): Promise<SocialMediaPost> {
    const existing = this.posts.get(id);
    if (!existing) throw new Error(`SocialMediaPost ${id} not found`);
    const updated: SocialMediaPost = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.posts.set(id, updated);
    await this.logger.info('Social media post updated', { id });
    return updated;
  }

  async deletePost(id: string): Promise<boolean> {
    const deleted = this.posts.delete(id);
    if (deleted) await this.logger.info('Social media post deleted', { id });
    return deleted;
  }

  async publishPost(id: string): Promise<SocialMediaPost> {
    const post = this.posts.get(id);
    if (!post) throw new Error(`SocialMediaPost ${id} not found`);
    if (post.status !== 'draft' && post.status !== 'scheduled') {
      throw new Error(`Post ${id} cannot be published from status ${post.status}`);
    }
    post.status = 'published';
    post.publishedAt = new Date();
    post.updatedAt = new Date();
    this.posts.set(id, post);
    await this.logger.info('Social media post published', { id });
    return post;
  }

  async updatePostMetrics(id: string, metrics: Partial<SocialMetrics>): Promise<SocialMediaPost> {
    const post = this.posts.get(id);
    if (!post) throw new Error(`SocialMediaPost ${id} not found`);
    post.metrics = { ...post.metrics, ...metrics };
    post.metrics.engagement = post.metrics.likes + post.metrics.comments + post.metrics.shares;
    post.updatedAt = new Date();
    this.posts.set(id, post);
    await this.logger.info('Post metrics updated', { id });
    return post;
  }

  async getPostsByPlatform(companyId: string, platform: SocialMediaPost['platform']): Promise<SocialMediaPost[]> {
    return Array.from(this.posts.values()).filter(
      p => p.companyId === companyId && p.platform === platform
    );
  }

  // ─── Dashboard ─────────────────────────────────────────────────────────────

  async getMarketingDashboard(companyId: string): Promise<MarketingDashboard> {
    const campaigns = Array.from(this.campaigns.values()).filter(c => c.companyId === companyId);
    const posts = Array.from(this.posts.values()).filter(p => p.companyId === companyId);
    const totalBudget = campaigns.reduce((s, c) => s + (c.budget ?? 0), 0);
    const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
    const totalRevenue = campaigns.reduce((s, c) => s + c.metrics.revenue, 0);

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalBudget,
      totalSpent,
      totalRevenue,
      overallROI: totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0,
      totalPosts: posts.length,
      publishedPosts: posts.filter(p => p.status === 'published').length,
      totalEngagement: posts.reduce((s, p) => s + p.metrics.engagement, 0),
    };
  }
}

export { Marketing as default };
