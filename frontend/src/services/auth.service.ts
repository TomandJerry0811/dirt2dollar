import type { User, LoginCredentials, LoginResponse, UserPermissions } from '@/types';

// ============================================================
// Universal Permissions
// Everyone has identical, full access across the entire application.
// ============================================================

export const UNIVERSAL_PERMISSIONS: UserPermissions = {
  canManageClients: true,
  canRunWorkflows: true,
  canExportReports: true,
  canManageUsers: true,
  canViewAIInsights: true,
  canManageSettings: true,
};

export const ALLOWED_ACCOUNTS = [
  {
    email: 'admin@email.com',
    password: '12345',
    name: 'Admin',
  },
  {
    email: 'admin@email',
    password: '12345',
    name: 'Admin',
  },
];

export const DEMO_CREDENTIALS = ALLOWED_ACCOUNTS[0];

export const AUTHORIZED_PERSONNEL = ALLOWED_ACCOUNTS;

// ============================================================
// Authentication Service Implementation
// ============================================================

export const authService = {
  /**
   * Authenticate only authorized administrator accounts.
   * Strictly restricted to admin@email and admin@email.com with password '12345'.
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Artificial latency for a smooth, natural verification feel
    await new Promise((resolve) => setTimeout(resolve, 350));

    const email = (credentials.email || '').trim().toLowerCase();
    const password = credentials.password || '';

    if (!email) {
      throw new Error('Please enter your email address.');
    }

    if (!password) {
      throw new Error('Please enter your password.');
    }

    // Strict validation: Only admin@email and admin@email.com with password 12345
    const matchedAccount = ALLOWED_ACCOUNTS.find(
      (account) => account.email.toLowerCase() === email
    );

    if (!matchedAccount || matchedAccount.password !== password) {
      throw new Error('Invalid email or password. Access is restricted to authorized administrator accounts.');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const user: User = {
      id: `usr-${matchedAccount.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email: matchedAccount.email,
      name: matchedAccount.name,
      role: 'admin',
      department: 'Operations & Strategy',
      permissions: UNIVERSAL_PERMISSIONS,
      createdAt: '2025-01-01T00:00:00Z',
      lastLoginAt: now.toISOString(),
    };

    const response: LoginResponse = {
      user,
      tokens: {
        accessToken: `ccp_tok_${user.id}_${Date.now()}`,
        refreshToken: `ccp_ref_${user.id}_${Date.now()}`,
        expiresAt,
        tokenType: 'Bearer',
      },
    };

    return response;
  },

  /**
   * Get pre-filled demo credentials for 1-click convenience
   */
  getDemoCredentials() {
    return DEMO_CREDENTIALS;
  },
};

