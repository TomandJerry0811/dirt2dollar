// ============================================================
// Auth Types
// ============================================================

export type UserRole = 'admin' | 'manager' | 'analyst' | 'viewer';

export interface UserPermissions {
  canManageClients: boolean;
  canRunWorkflows: boolean;
  canExportReports: boolean;
  canManageUsers: boolean;
  canViewAIInsights: boolean;
  canManageSettings: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  permissions: UserPermissions;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tokenType: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// ============================================================
// Settings Types
// ============================================================

export type Theme = 'light' | 'dark' | 'system';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR';

export interface NotificationPreferences {
  emailAlerts: boolean;
  pushNotifications: boolean;
  criticalChurnAlerts: boolean;
  weeklyDigest: boolean;
  workflowFailures: boolean;
}

export interface UserSettings {
  theme: Theme;
  language: string;
  dateFormat: DateFormat;
  currency: CurrencyCode;
  timezone: string;
  notifications: NotificationPreferences;
  sidebarCollapsed: boolean;
  compactMode: boolean;
}

export interface AppSettings {
  appName: string;
  logoUrl?: string;
  primaryColor?: string;
  churnThresholds: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  aiModel: string;
  refreshInterval: number;
}

// ============================================================
// API Types
// ============================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}
