export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  role: UserRole;
  createdAt: Date;
  lastLoginAt?: Date;
}

export type UserRole = 'admin' | 'user' | 'viewer';

export interface Tenant {
  id: string;
  name: string;
  plan: TenantPlan;
  maxRequestsPerMonth: number;
  maxModels: string[];
  createdAt: Date;
}

export type TenantPlan = 'free' | 'pro' | 'enterprise';

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface APIKey {
  id: string;
  key: string;
  name: string;
  tenantId: string;
  permissions: APIPermission[];
  createdAt: Date;
  expiresAt?: Date;
}

export type APIPermission = 'chat:read' | 'chat:write' | 'admin:read' | 'admin:write';
