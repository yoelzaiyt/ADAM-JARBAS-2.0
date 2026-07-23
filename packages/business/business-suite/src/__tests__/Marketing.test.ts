import { describe, it, expect, beforeEach } from 'vitest';
import { Marketing } from '../marketing/Marketing.js';

const CID = 'comp-1';

function campaignData(overrides = {}) {
  return {
    companyId: CID,
    name: 'Spring Launch',
    type: 'email' as const,
    status: 'draft' as const,
    budget: 10000,
    spent: 0,
    targetAudience: 'Existing customers',
    content: 'Check out our new products!',
    startDate: undefined,
    endDate: undefined,
    tags: [],
    ...overrides,
  };
}

function postData(overrides = {}) {
  return {
    companyId: CID,
    campaignId: 'camp-1',
    platform: 'twitter' as const,
    status: 'draft' as const,
    content: 'Exciting news coming soon!',
    scheduledAt: undefined,
    publishedAt: undefined,
    tags: [],
    ...overrides,
  };
}

describe('Marketing', () => {
  let marketing: Marketing;

  beforeEach(() => {
    marketing = new Marketing();
  });

  it('creates and retrieves a campaign', async () => {
    const c = await marketing.createCampaign(campaignData());
    expect(c.id).toBeDefined();
    expect(c.metrics.impressions).toBe(0);
    const found = await marketing.getCampaignById(c.id);
    expect(found?.name).toBe('Spring Launch');
  });

  it('lists campaigns with status filter', async () => {
    await marketing.createCampaign(campaignData({ name: 'C1', status: 'draft' }));
    await marketing.createCampaign(campaignData({ name: 'C2', status: 'active' }));
    const drafts = await marketing.listCampaigns(CID, { status: 'draft' });
    expect(drafts).toHaveLength(1);
  });

  it('campaign lifecycle: draft -> active -> paused -> completed', async () => {
    const c = await marketing.createCampaign(campaignData());
    const started = await marketing.startCampaign(c.id);
    expect(started.status).toBe('active');
    const paused = await marketing.pauseCampaign(c.id);
    expect(paused.status).toBe('paused');
    const completed = await marketing.completeCampaign(c.id);
    expect(completed.status).toBe('completed');
    expect(completed.endDate).toBeDefined();
  });

  it('cannot start a campaign from completed status', async () => {
    const c = await marketing.createCampaign(campaignData());
    await marketing.startCampaign(c.id);
    await marketing.completeCampaign(c.id);
    await expect(marketing.startCampaign(c.id)).rejects.toThrow('cannot be started');
  });

  it('updates campaign metrics and computes ROI', async () => {
    const c = await marketing.createCampaign(campaignData({ spent: 5000 }));
    const updated = await marketing.updateCampaignMetrics(c.id, { revenue: 15000, impressions: 1000, clicks: 200 });
    expect(updated.metrics.roi).toBe(((15000 - 5000) / 5000) * 100);
    const roi = await marketing.getCampaignROI(c.id);
    expect(roi?.revenue).toBe(15000);
  });

  it('creates and publishes a social post', async () => {
    const p = await marketing.createPost(postData());
    expect(p.metrics.likes).toBe(0);
    const published = await marketing.publishPost(p.id);
    expect(published.status).toBe('published');
    expect(published.publishedAt).toBeDefined();
  });

  it('updates post metrics and computes engagement', async () => {
    const p = await marketing.createPost(postData());
    const updated = await marketing.updatePostMetrics(p.id, { likes: 10, comments: 5, shares: 3 });
    expect(updated.metrics.engagement).toBe(18);
  });

  it('builds marketing dashboard', async () => {
    await marketing.createCampaign(campaignData({ name: 'C1', budget: 5000, spent: 2000 }));
    await marketing.createPost(postData({ platform: 'twitter' }));
    await marketing.createPost(postData({ platform: 'instagram', status: 'published' }));
    const dash = await marketing.getMarketingDashboard(CID);
    expect(dash.totalCampaigns).toBe(1);
    expect(dash.totalPosts).toBe(2);
    expect(dash.publishedPosts).toBe(1);
  });
});
