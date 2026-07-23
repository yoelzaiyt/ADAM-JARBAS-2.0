import { describe, it, expect, beforeEach } from 'vitest';
import { BusinessSuite } from '../BusinessSuite.js';
import type { BusinessSuiteConfig } from '../interfaces.js';

function config(overrides = {}): BusinessSuiteConfig {
  return {
    defaultCurrency: 'BRL',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    features: {
      crm: true, erp: true, finance: true, accounting: true, treasury: true,
      sales: true, purchasing: true, inventory: true, logistics: true,
      hr: true, payroll: true, legal: true, contracts: true, compliance: true,
      marketing: true, customerSuccess: true, serviceDesk: true, projects: true,
      kanban: true, bi: true, forecasting: true, analytics: true,
      workflowEngine: true, approvalEngine: true, documentManager: true, reportGenerator: true,
    },
    integrations: [],
    security: {
      rbac: true, abac: false, lgpd: true, encryption: true,
      audit: true, mfa: false, rateLimit: true, tenantIsolation: true,
    },
    ...overrides,
  };
}

describe('BusinessSuite', () => {
  let suite: BusinessSuite;

  beforeEach(() => {
    suite = new BusinessSuite(config());
  });

  it('initializes with all module properties', () => {
    expect(suite.accounting).toBeDefined();
    expect(suite.analytics).toBeDefined();
    expect(suite.bi).toBeDefined();
    expect(suite.companyManager).toBeDefined();
    expect(suite.compliance).toBeDefined();
    expect(suite.contracts).toBeDefined();
    expect(suite.crm).toBeDefined();
    expect(suite.customerSuccess).toBeDefined();
    expect(suite.erp).toBeDefined();
    expect(suite.finance).toBeDefined();
    expect(suite.forecasting).toBeDefined();
    expect(suite.hr).toBeDefined();
    expect(suite.inventory).toBeDefined();
    expect(suite.kanban).toBeDefined();
    expect(suite.legal).toBeDefined();
    expect(suite.logistics).toBeDefined();
    expect(suite.marketing).toBeDefined();
    expect(suite.payroll).toBeDefined();
    expect(suite.projects).toBeDefined();
    expect(suite.purchasing).toBeDefined();
    expect(suite.sales).toBeDefined();
    expect(suite.serviceDesk).toBeDefined();
    expect(suite.treasury).toBeDefined();
    expect(suite.workflowEngine).toBeDefined();
    expect(suite.approvalEngine).toBeDefined();
    expect(suite.notificationCenter).toBeDefined();
    expect(suite.documentManager).toBeDefined();
    expect(suite.reportGenerator).toBeDefined();
    expect(suite.integrations).toBeDefined();
    expect(suite.api).toBeDefined();
    expect(suite.monitoring).toBeDefined();
  });

  it('returns config via getConfig()', () => {
    const c = suite.getConfig();
    expect(c.defaultCurrency).toBe('BRL');
    expect(c.timezone).toBe('America/Sao_Paulo');
    expect(c.language).toBe('pt-BR');
  });

  it('getConfig returns a copy, not a reference', () => {
    const c = suite.getConfig();
    c.defaultCurrency = 'USD';
    expect(suite.getConfig().defaultCurrency).toBe('BRL');
  });

  it('getModuleHealth returns all modules as healthy', async () => {
    const health = await suite.getModuleHealth();
    expect(health).toHaveLength(31);
    expect(health.every(m => m.status === 'healthy' && m.initialized)).toBe(true);
  });

  it('module names match expected list', async () => {
    const health = await suite.getModuleHealth();
    const names = health.map(h => h.name);
    expect(names).toContain('accounting');
    expect(names).toContain('crm');
    expect(names).toContain('workflowEngine');
    expect(names).toContain('monitoring');
    expect(names).toContain('api');
  });

  it('bi module creates dashboards', async () => {
    const d = await suite.bi.createDashboard({
      companyId: 'c1', name: 'Test', type: 'custom', profileRole: 'admin',
      layout: { columns: 12, rows: 8 }, isDefault: true,
    });
    expect(d.id).toBeDefined();
  });

  it('forecasting module generates forecasts', async () => {
    const f = await suite.forecasting.generateForecast({
      type: 'revenue', companyId: 'c1', period: '2025',
      historicalData: [{ date: new Date(2025, 0, 1), value: 100 }, { date: new Date(2025, 1, 1), value: 200 }],
    });
    expect(f.dataPoints.length).toBeGreaterThan(0);
  });
});
