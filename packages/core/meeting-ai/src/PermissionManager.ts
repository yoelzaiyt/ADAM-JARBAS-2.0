import type {
  PermissionManager as IPermissionManager,
  Permission,
  ConsentRecord,
  PermissionAction,
} from './interfaces.js';

export class PermissionManager implements IPermissionManager {
  private permissions: Map<string, Permission> = new Map();
  private consents: ConsentRecord[] = [];

  private key(userId: string, meetingId: string, action: PermissionAction): string {
    return `${userId}::${meetingId}::${action}`;
  }

  checkPermission(userId: string, meetingId: string, action: PermissionAction): boolean {
    const perm = this.permissions.get(this.key(userId, meetingId, action));
    return perm?.granted ?? false;
  }

  grantPermission(userId: string, meetingId: string, action: PermissionAction): void {
    this.permissions.set(this.key(userId, meetingId, action), {
      userId, meetingId, action, granted: true, grantedAt: new Date(),
    });
  }

  revokePermission(userId: string, meetingId: string, action: PermissionAction): void {
    this.permissions.set(this.key(userId, meetingId, action), {
      userId, meetingId, action, granted: false,
    });
  }

  recordConsent(consent: ConsentRecord): void {
    this.consents.push(consent);
  }

  getConsent(meetingId: string): ConsentRecord[] {
    return this.consents.filter(c => c.meetingId === meetingId);
  }

  hasConsent(meetingId: string, userId: string): boolean {
    return this.consents.some(c => c.meetingId === meetingId && c.userId === userId && c.consented);
  }
}
