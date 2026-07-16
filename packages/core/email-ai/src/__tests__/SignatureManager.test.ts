import { describe, it, expect, beforeEach } from 'vitest';
import { SignatureManager } from '../SignatureManager.js';

describe('SignatureManager', () => {
  let mgr: SignatureManager;

  beforeEach(() => { mgr = new SignatureManager(); });

  it('creates manager', () => { expect(mgr).toBeDefined(); });

  it('addSignature adds', () => {
    mgr.addSignature({ name: 'Personal', html: '<b>Test</b>', text: 'Test', isDefault: true, isCorporate: false, identityEmail: 'a@test.com' });
    expect(mgr.getSignatures().length).toBe(1);
  });

  it('setDefault sets default', () => {
    const s1 = mgr.addSignature({ name: 'A', html: '', text: '', isDefault: false, isCorporate: false, identityEmail: 'a@test.com' });
    const s2 = mgr.addSignature({ name: 'B', html: '', text: '', isDefault: false, isCorporate: false, identityEmail: 'b@test.com' });
    mgr.setDefault(s2.id);
    expect(mgr.getDefault()?.id).toBe(s2.id);
  });

  it('getByDepartment returns matches', () => {
    mgr.addSignature({ name: 'Dev', html: '', text: '', isDefault: false, isCorporate: true, department: 'Engineering', identityEmail: 'a@test.com' });
    expect(mgr.getByDepartment('Engineering').length).toBe(1);
  });

  it('deleteSignature removes', () => {
    const s = mgr.addSignature({ name: 'Test', html: '', text: '', isDefault: false, isCorporate: false, identityEmail: 'a@test.com' });
    mgr.deleteSignature(s.id);
    expect(mgr.getSignatures().length).toBe(0);
  });
});
