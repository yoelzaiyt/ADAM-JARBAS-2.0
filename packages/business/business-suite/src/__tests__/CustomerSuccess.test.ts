import { describe, it, expect, beforeEach } from 'vitest';
import { CustomerSuccess } from '../customer-success/CustomerSuccess.js';

const CID = 'comp-1';

function csData(overrides = {}) {
  return {
    companyId: CID,
    customerId: 'cust-1',
    customerName: 'Acme Inc',
    health: 'healthy' as const,
    assignedTo: 'csm-1',
    npsScore: undefined,
    satisfactionScore: undefined,
    renewalDate: new Date('2025-12-31'),
    contractValue: 50000,
    tags: [],
    notes: '',
    ...overrides,
  };
}

function onboardingData(overrides = {}) {
  return {
    companyId: CID,
    customerId: 'cust-2',
    status: 'not_started' as const,
    assignedTo: 'csm-1',
    startDate: undefined,
    completedDate: undefined,
    currentStep: 0,
    totalSteps: 3,
    steps: [
      { id: 's1', name: 'Account Setup', completed: false, completedAt: undefined },
      { id: 's2', name: 'Data Import', completed: false, completedAt: undefined },
      { id: 's3', name: 'Training', completed: false, completedAt: undefined },
    ],
    ...overrides,
  };
}

describe('CustomerSuccess', () => {
  let cs: CustomerSuccess;

  beforeEach(() => {
    cs = new CustomerSuccess();
  });

  it('creates and retrieves a CS record', async () => {
    const r = await cs.createCustomerSuccessRecord(csData());
    expect(r.id).toBeDefined();
    const found = await cs.getCustomerSuccessRecordById(r.id);
    expect(found?.customerName).toBe('Acme Inc');
  });

  it('updates NPS and satisfaction scores', async () => {
    const r = await cs.createCustomerSuccessRecord(csData());
    const withNps = await cs.updateNpsScore(r.id, 9);
    expect(withNps.npsScore).toBe(9);
    const withSat = await cs.updateSatisfactionScore(r.id, 85);
    expect(withSat.satisfactionScore).toBe(85);
  });

  it('rejects out-of-range NPS', async () => {
    const r = await cs.createCustomerSuccessRecord(csData());
    await expect(cs.updateNpsScore(r.id, 11)).rejects.toThrow('between 0 and 10');
  });

  it('updates health status', async () => {
    const r = await cs.createCustomerSuccessRecord(csData());
    const updated = await cs.updateHealth(r.id, 'at_risk');
    expect(updated.health).toBe('at_risk');
  });

  it('builds health summary', async () => {
    await cs.createCustomerSuccessRecord(csData({ health: 'healthy', npsScore: 9, satisfactionScore: 90 }));
    await cs.createCustomerSuccessRecord(csData({ health: 'at_risk', npsScore: 5, satisfactionScore: 50 }));
    await cs.createCustomerSuccessRecord(csData({ health: 'critical', npsScore: 2, satisfactionScore: 30 }));
    const summary = await cs.getHealthSummary(CID);
    expect(summary.total).toBe(3);
    expect(summary.healthy).toBe(1);
    expect(summary.atRisk).toBe(1);
    expect(summary.critical).toBe(1);
    expect(summary.averageNps).toBeCloseTo(5.33, 1);
  });

  it('starts onboarding and completes steps', async () => {
    const o = await cs.createOnboarding(onboardingData());
    const started = await cs.startOnboarding(o.id);
    expect(started.status).toBe('in_progress');
    const s1 = await cs.completeOnboardingStep(o.id, 's1');
    expect(s1.currentStep).toBe(1);
    expect(s1.steps[0].completed).toBe(true);
    await cs.completeOnboardingStep(o.id, 's2');
    const completed = await cs.completeOnboardingStep(o.id, 's3');
    expect(completed.status).toBe('completed');
    expect(completed.completedDate).toBeDefined();
  });

  it('cannot complete an already completed step', async () => {
    const o = await cs.createOnboarding(onboardingData());
    await cs.startOnboarding(o.id);
    await cs.completeOnboardingStep(o.id, 's1');
    await expect(cs.completeOnboardingStep(o.id, 's1')).rejects.toThrow('already completed');
  });
});
