export type SubscriptionDuration = 'daily' | 'weekly' | 'monthly';

export type KeyStatus = 'unused' | 'active' | 'expired' | 'revoked';

export interface KeyPermission {
  id: string;
  name: string;
  description: string;
}

export interface LicenseKey {
  id: string;
  key: string;
  clientName: string;
  duration: SubscriptionDuration;
  status: KeyStatus;
  permissions: string[]; // List of permission IDs
  createdAt: string;
  expiresAt: string | null; // Null if unused, calculated when activated
  activatedAt: string | null;
  maxDevices: number;
  devicesUsed: number;
  notes: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  action: string;
  clientName: string;
  keySnippet: string;
  type: 'create' | 'activate' | 'revoke' | 'validate_success' | 'validate_failed';
}

export interface DashboardStatsData {
  totalKeys: number;
  activeKeys: number;
  unusedKeys: number;
  expiredKeys: number;
  revokedKeys: number;
  durationCounts: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}
