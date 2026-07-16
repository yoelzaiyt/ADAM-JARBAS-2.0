import { describe, it, expect, beforeEach } from 'vitest';
import { CompanyManager } from '../company-manager/CompanyManager.js';

const addr = { street: 'Rua A', number: '100', neighborhood: 'Centro', city: 'SP', state: 'SP', zipCode: '01000-000', country: 'BR' };

function companyData(overrides = {}) {
  return {
    tenantId: 't1',
    name: 'Acme',
    legalName: 'Acme LTDA',
    cnpj: '12345678000199',
    taxRegime: 'simples_nacional' as const,
    size: 'small' as const,
    status: 'active' as const,
    industry: 'Tech',
    email: 'acme@test.com',
    phone: '11999990000',
    address: addr,
    ...overrides,
  };
}

describe('CompanyManager', () => {
  let mgr: CompanyManager;

  beforeEach(() => {
    mgr = new CompanyManager();
  });

  it('creates a company with id and timestamps', async () => {
    const c = await mgr.createCompany(companyData());
    expect(c.id).toBeDefined();
    expect(c.createdAt).toBeInstanceOf(Date);
    expect(c.name).toBe('Acme');
  });

  it('retrieves company by id', async () => {
    const c = await mgr.createCompany(companyData());
    const found = await mgr.getCompanyById(c.id);
    expect(found?.cnpj).toBe('12345678000199');
  });

  it('lists and filters companies by tenantId', async () => {
    await mgr.createCompany(companyData({ tenantId: 't1' }));
    await mgr.createCompany(companyData({ tenantId: 't2', name: 'Beta' }));
    const t1 = await mgr.listCompanies('t1');
    const all = await mgr.listCompanies();
    expect(t1).toHaveLength(1);
    expect(all).toHaveLength(2);
  });

  it('updates a company', async () => {
    const c = await mgr.createCompany(companyData());
    const updated = await mgr.updateCompany(c.id, { name: 'Acme 2.0' });
    expect(updated.name).toBe('Acme 2.0');
    expect(updated.id).toBe(c.id);
  });

  it('throws when updating non-existent company', async () => {
    await expect(mgr.updateCompany('bad-id', { name: 'X' })).rejects.toThrow('not found');
  });

  it('deletes a company', async () => {
    const c = await mgr.createCompany(companyData());
    expect(await mgr.deleteCompany(c.id)).toBe(true);
    expect(await mgr.getCompanyById(c.id)).toBeUndefined();
  });

  it('CRUD operations for branches', async () => {
    const c = await mgr.createCompany(companyData());
    const b = await mgr.createBranch({ companyId: c.id, name: 'Filial 1', code: 'F1', cnpj: '111', address: addr, phone: '11', email: 'f@t.com', isHeadquarters: false, status: 'active' });
    const list = await mgr.listBranches(c.id);
    expect(list).toHaveLength(1);
    await mgr.updateBranch(b.id, { name: 'Filial Updated' });
    const updated = await mgr.getBranchById(b.id);
    expect(updated?.name).toBe('Filial Updated');
    await mgr.deleteBranch(b.id);
    expect(await mgr.listBranches(c.id)).toHaveLength(0);
  });

  it('CRUD operations for departments and multi-tenant isolation', async () => {
    const c1 = await mgr.createCompany(companyData({ tenantId: 't1' }));
    const c2 = await mgr.createCompany(companyData({ tenantId: 't2', name: 'Beta' }));
    await mgr.createDepartment({ companyId: c1.id, name: 'Eng', code: 'ENG', status: 'active' });
    await mgr.createDepartment({ companyId: c2.id, name: 'Sales', code: 'SAL', status: 'active' });
    expect(await mgr.listDepartments(c1.id)).toHaveLength(1);
    expect(await mgr.listDepartments(c2.id)).toHaveLength(1);
  });
});
