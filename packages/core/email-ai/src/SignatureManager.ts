import { randomUUID } from 'node:crypto';
import type {
  SignatureManager as ISignatureManager,
  EmailSignature,
} from './interfaces.js';

export class SignatureManager implements ISignatureManager {
  private signatures: EmailSignature[] = [];

  getSignatures(): EmailSignature[] { return [...this.signatures]; }

  getSignature(signatureId: string): EmailSignature | null {
    return this.signatures.find(s => s.id === signatureId) ?? null;
  }

  getDefault(): EmailSignature | null {
    return this.signatures.find(s => s.isDefault) ?? null;
  }

  getByDepartment(department: string): EmailSignature[] {
    return this.signatures.filter(s => s.department === department);
  }

  addSignature(signature: Omit<EmailSignature, 'id' | 'createdAt'>): EmailSignature {
    const full: EmailSignature = { ...signature, id: randomUUID(), createdAt: new Date() };
    this.signatures.push(full);
    return full;
  }

  updateSignature(signatureId: string, updates: Partial<EmailSignature>): EmailSignature {
    const sig = this.signatures.find(s => s.id === signatureId);
    if (!sig) throw new Error(`Signature not found: ${signatureId}`);
    Object.assign(sig, updates, { id: signatureId });
    return sig;
  }

  deleteSignature(signatureId: string): void {
    this.signatures = this.signatures.filter(s => s.id !== signatureId);
  }

  setDefault(signatureId: string): void {
    for (const s of this.signatures) s.isDefault = s.id === signatureId;
  }
}
