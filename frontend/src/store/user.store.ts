import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserRole, UserPermissions } from '@/types';

// ============================================================
// Managed User Types & Presets
// ============================================================

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'active' | 'suspended';
  permissions: UserPermissions;
  lastLoginAt?: string;
  createdAt: string;
}

export const ROLE_PRESET_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canManageClients: true,
    canRunWorkflows: true,
    canExportReports: true,
    canManageUsers: true,
    canViewAIInsights: true,
    canManageSettings: true,
  },
  manager: {
    canManageClients: true,
    canRunWorkflows: true,
    canExportReports: true,
    canManageUsers: false,
    canViewAIInsights: true,
    canManageSettings: false,
  },
  analyst: {
    canManageClients: false,
    canRunWorkflows: true,
    canExportReports: true,
    canManageUsers: false,
    canViewAIInsights: true,
    canManageSettings: false,
  },
  viewer: {
    canManageClients: false,
    canRunWorkflows: false,
    canExportReports: true,
    canManageUsers: false,
    canViewAIInsights: true,
    canManageSettings: false,
  },
};

export const INITIAL_USERS: ManagedUser[] = [
  {
    id: 'usr-1',
    name: 'Administrator',
    email: 'admin@email.com',
    role: 'admin',
    department: 'Leadership & Strategy',
    status: 'active',
    permissions: ROLE_PRESET_PERMISSIONS.admin,
    lastLoginAt: 'Just now',
    createdAt: '2025-01-10T09:00:00Z',
  },
  {
    id: 'usr-2',
    name: 'Administrator',
    email: 'admin@email',
    role: 'admin',
    department: 'Leadership & Strategy',
    status: 'active',
    permissions: ROLE_PRESET_PERMISSIONS.admin,
    lastLoginAt: 'Never logged in',
    createdAt: '2025-02-01T14:30:00Z',
  },
  {
    id: 'usr-3',
    name: 'Marcus Vance',
    email: 'marcus.vance@churnpredictor.ai',
    role: 'analyst',
    department: 'Data & Risk Analytics',
    status: 'active',
    permissions: ROLE_PRESET_PERMISSIONS.analyst,
    lastLoginAt: '5 hours ago',
    createdAt: '2025-02-15T11:15:00Z',
  },
  {
    id: 'usr-4',
    name: 'Priya Sharma',
    email: 'priya.sharma@churnpredictor.ai',
    role: 'analyst',
    department: 'Machine Learning',
    status: 'active',
    permissions: ROLE_PRESET_PERMISSIONS.analyst,
    lastLoginAt: '1 day ago',
    createdAt: '2025-03-01T16:00:00Z',
  },
  {
    id: 'usr-5',
    name: 'David Kim',
    email: 'david.kim@churnpredictor.ai',
    role: 'viewer',
    department: 'Executive Board',
    status: 'active',
    permissions: ROLE_PRESET_PERMISSIONS.viewer,
    lastLoginAt: '3 days ago',
    createdAt: '2025-03-10T10:45:00Z',
  },
];

interface UserStore {
  users: ManagedUser[];
  createUser: (user: Omit<ManagedUser, 'id' | 'createdAt'>) => ManagedUser;
  updateUser: (id: string, updates: Partial<ManagedUser>) => void;
  updatePermissions: (id: string, permissions: Partial<UserPermissions>) => void;
  toggleUserStatus: (id: string) => void;
  deleteUser: (id: string) => void;
  resetToDefaults: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      users: INITIAL_USERS,

      createUser: (userData) => {
        const newUser: ManagedUser = {
          ...userData,
          id: `usr-${Date.now()}`,
          createdAt: new Date().toISOString(),
          lastLoginAt: 'Never logged in',
        };
        set((state) => ({ users: [newUser, ...state.users] }));
        return newUser;
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        }));
      },

      updatePermissions: (id, newPermissions) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id
              ? { ...u, permissions: { ...u.permissions, ...newPermissions } }
              : u
          ),
        }));
      },

      toggleUserStatus: (id) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id
              ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
              : u
          ),
        }));
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));
      },

      resetToDefaults: () => {
        set({ users: INITIAL_USERS });
      },
    }),
    {
      name: 'ccp-user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
