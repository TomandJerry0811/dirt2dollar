import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  UserPlus,
  Users,
  KeyRound,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Shield,
  CheckCircle2,
  Ban,
  RotateCcw,
} from 'lucide-react';
import { ContentWrapper, PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/MetricCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useUserStore, type ManagedUser, ROLE_PRESET_PERMISSIONS } from '@/store';
import type { UserRole, UserPermissions } from '@/types';
import { cn } from '@/utils';
import { toast } from 'sonner';

const ROLE_COLORS: Record<UserRole, { badge: string; border: string; text: string }> = {
  admin: {
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    border: 'border-purple-500',
    text: 'text-purple-600 dark:text-purple-400',
  },
  manager: {
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    border: 'border-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
  },
  analyst: {
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    border: 'border-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  viewer: {
    badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    border: 'border-slate-500',
    text: 'text-slate-600 dark:text-slate-400',
  },
};

const PERMISSION_LABELS: { key: keyof UserPermissions; label: string; description: string }[] = [
  { key: 'canManageClients', label: 'Manage Clients', description: 'Create, edit, and archive client accounts' },
  { key: 'canRunWorkflows', label: 'Run AI Workflows', description: 'Trigger LangGraph pipelines and Groq inference' },
  { key: 'canExportReports', label: 'Export Reports', description: 'Download CSV summaries and executive PDF reports' },
  { key: 'canViewAIInsights', label: 'View AI Insights', description: 'Access vector similarity recommendations and churn predictions' },
  { key: 'canManageUsers', label: 'Manage Users & Access', description: 'Invite team members and configure role access rights' },
  { key: 'canManageSettings', label: 'System Settings', description: 'Configure integrations, API keys, and model thresholds' },
];

export function UsersPage() {
  const { users, createUser, updateUser, updatePermissions, toggleUserStatus, deleteUser, resetToDefaults } = useUserStore();

  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<ManagedUser | null>(null);

  // New user form state
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    department: 'Operations',
    role: 'analyst' as UserRole,
    permissions: { ...ROLE_PRESET_PERMISSIONS.analyst },
  });

  const handleRoleChangeInForm = (role: UserRole) => {
    setFormData((prev) => ({
      ...prev,
      role,
      permissions: { ...ROLE_PRESET_PERMISSIONS[role] },
    }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Please provide user name and valid work email.');
      return;
    }

    createUser({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role,
      department: formData.department.trim() || 'General',
      status: 'active',
      permissions: formData.permissions,
    });

    toast.success(`User "${formData.name}" created and granted access!`);
    setIsCreateOpen(false);
    setFormData({
      name: '',
      email: '',
      department: 'Operations',
      role: 'analyst',
      permissions: { ...ROLE_PRESET_PERMISSIONS.analyst },
    });
  };

  const handleSavePermissions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUser(editingUser.id, {
      name: editingUser.name,
      department: editingUser.department,
      role: editingUser.role,
      permissions: editingUser.permissions,
      status: editingUser.status,
    });

    toast.success(`Permissions updated for ${editingUser.name}`);
    setEditingUser(null);
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeCount = users.filter((u) => u.status === 'active').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <ContentWrapper className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Users & Access Management
            </h1>
            <Badge variant="outline" size="sm" className="gap-1.5 border-primary/30 text-primary bg-primary/5">
              <ShieldCheck className="h-3.5 w-3.5" />
              RBAC Enabled
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Create team members, manage enterprise login credentials, and configure fine-grained role permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetToDefaults();
              toast.info('Team roster reset to default template');
            }}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Reset Template
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<UserPlus className="h-3.5 w-3.5" />}
          >
            Add New User
          </Button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SectionCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Personnel
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{users.length}</p>
          <p className="text-[11.5px] text-muted-foreground mt-1.5">Across all departments</p>
        </SectionCard>

        <SectionCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Access
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{activeCount}</p>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11.5px] text-emerald-500 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Authorized credentials</span>
          </div>
        </SectionCard>

        <SectionCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Admin Accounts
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{adminCount}</p>
          <p className="text-[11.5px] text-muted-foreground mt-1.5">Full unrestricted privileges</p>
        </SectionCard>

        <SectionCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Security Protocol
            </span>
            <div className="p-2 rounded-lg bg-info/10 text-info">
              <KeyRound className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">Enforced</p>
          <p className="text-[11.5px] text-muted-foreground mt-1.5">Enterprise JWT + Token Auth</p>
        </SectionCard>
      </div>

      {/* Directory Table Section */}
      <SectionCard className="p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Team Directory & Permissions
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review user profiles, assigned roles, and toggle individual granular capabilities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user, email, dept…"
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-48 sm:w-56"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-secondary/30 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none cursor-pointer"
            >
              <option value="all" className="bg-card text-foreground">All Roles</option>
              <option value="admin" className="bg-card text-foreground">Admin</option>
              <option value="manager" className="bg-card text-foreground">Manager</option>
              <option value="analyst" className="bg-card text-foreground">Analyst</option>
              <option value="viewer" className="bg-card text-foreground">Viewer</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-secondary/30 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none cursor-pointer"
            >
              <option value="all" className="bg-card text-foreground">All Statuses</option>
              <option value="active" className="bg-card text-foreground">Active</option>
              <option value="suspended" className="bg-card text-foreground">Suspended</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 text-muted-foreground uppercase text-[11px] font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Granular Permissions</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const roleStyle = ROLE_COLORS[user.role] || ROLE_COLORS.viewer;
                  const initials = user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();

                  const activePermissionsCount = Object.values(user.permissions).filter(Boolean).length;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-secondary/20 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs bg-secondary text-foreground border', roleStyle.border)}>
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-[12.5px] leading-tight">
                              {user.name}
                            </p>
                            <p className="text-muted-foreground text-[11px] mt-0.5 font-mono">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 text-foreground font-medium">
                        {user.department}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border',
                            roleStyle.badge
                          )}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Permissions Summary */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1 max-w-xs">
                          {user.permissions.canManageClients && (
                            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">
                              Clients
                            </span>
                          )}
                          {user.permissions.canRunWorkflows && (
                            <span className="px-1.5 py-0.5 rounded bg-info/10 text-info text-[10px] font-medium">
                              Workflows
                            </span>
                          )}
                          {user.permissions.canExportReports && (
                            <span className="px-1.5 py-0.5 rounded bg-secondary text-muted-foreground text-[10px] font-medium">
                              Reports
                            </span>
                          )}
                          {user.permissions.canViewAIInsights && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-medium">
                              AI Insights
                            </span>
                          )}
                          {user.permissions.canManageUsers && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 text-[10px] font-medium">
                              Users
                            </span>
                          )}
                          {user.permissions.canManageSettings && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-medium">
                              Settings
                            </span>
                          )}
                          {activePermissionsCount === 0 && (
                            <span className="text-[11px] text-muted-foreground italic">Read-only view</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {user.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-emerald-500/10 text-emerald-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-destructive/10 text-destructive">
                            <Ban className="h-3 w-3" />
                            Suspended
                          </span>
                        )}
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                        {user.lastLoginAt}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingUser({ ...user, permissions: { ...user.permissions } })}
                            title="Edit Permissions & Access"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              toggleUserStatus(user.id);
                              toast.info(
                                `User status changed to ${user.status === 'active' ? 'Suspended' : 'Active'}`
                              );
                            }}
                            title={user.status === 'active' ? 'Suspend Access' : 'Activate Access'}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-amber-500 hover:bg-secondary transition-colors"
                          >
                            {user.status === 'active' ? (
                              <Lock className="h-3.5 w-3.5" />
                            ) : (
                              <Unlock className="h-3.5 w-3.5" />
                            )}
                          </button>
                          {user.email !== 'admin@churnpredictor.ai' && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${user.name}?`)) {
                                  deleteUser(user.id);
                                  toast.success(`User ${user.name} removed`);
                                }
                              }}
                              title="Delete User"
                              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground italic text-xs">
                    No users matching current search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11.5px] text-muted-foreground pt-2">
          <p>
            Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
          </p>
          <div className="flex items-center gap-3">
            <span>Role-Based Permissions: <strong>Admin · Manager · Analyst · Viewer</strong></span>
          </div>
        </div>
      </SectionCard>

      {/* Role Permissions Matrix Explainer */}
      <SectionCard className="p-5">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
          <KeyRound className="h-4 w-4 text-primary" />
          Access Level Reference Matrix
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Default permission distribution associated with platform security tiers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-1.5">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Admin
            </span>
            <p className="text-[11.5px] text-foreground font-medium">Unrestricted Platform Control</p>
            <p className="text-[11px] text-muted-foreground">Full capability across clients, workflows, model thresholds, users, and enterprise settings.</p>
          </div>

          <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-1.5">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Manager
            </span>
            <p className="text-[11.5px] text-foreground font-medium">Operations & Execution</p>
            <p className="text-[11px] text-muted-foreground">Can manage client records, trigger AI pipelines, export executive reports, and review churn risks.</p>
          </div>

          <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1.5">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Analyst
            </span>
            <p className="text-[11.5px] text-foreground font-medium">Intelligence & Analytics</p>
            <p className="text-[11px] text-muted-foreground">Can view predictive churn scores, inspect embeddings, run workflows, and export CSV/PDF reports.</p>
          </div>

          <div className="p-3 rounded-xl border border-slate-500/20 bg-slate-500/5 space-y-1.5">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Viewer
            </span>
            <p className="text-[11.5px] text-foreground font-medium">Executive Audit & Read-Only</p>
            <p className="text-[11px] text-muted-foreground">Read-only visibility for executive board stakeholders and client dashboards without edit privileges.</p>
          </div>
        </div>
      </SectionCard>

      {/* ============================================================ */}
      {/* 1. Modal: Create New User */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Add New User</h3>
                    <p className="text-xs text-muted-foreground">Grant access and configure system permissions</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Jordan Miller"
                      className="w-full bg-secondary/30 border border-border focus:border-primary rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Work Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@churnpredictor.ai"
                      className="w-full bg-secondary/30 border border-border focus:border-primary rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Customer Success"
                      className="w-full bg-secondary/30 border border-border focus:border-primary rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Security Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleRoleChangeInForm(e.target.value as UserRole)}
                      className="w-full bg-secondary/30 border border-border focus:border-primary rounded-lg px-3 py-2 text-xs text-foreground outline-none cursor-pointer"
                    >
                      <option value="admin" className="bg-card text-foreground">Admin (Full Control)</option>
                      <option value="manager" className="bg-card text-foreground">Manager (Operations)</option>
                      <option value="analyst" className="bg-card text-foreground">Analyst (Insights & AI)</option>
                      <option value="viewer" className="bg-card text-foreground">Viewer (Read-Only)</option>
                    </select>
                  </div>
                </div>

                {/* Granular Permissions Section */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">Granular Permission Rights</label>
                    <span className="text-[11px] text-muted-foreground">Adjust capabilities if needed</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {PERMISSION_LABELS.map(({ key, label, description }) => {
                      const checked = !!formData.permissions[key];
                      return (
                        <label
                          key={key}
                          className={cn(
                            'flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors text-xs',
                            checked ? 'bg-primary/5 border-primary/30' : 'bg-secondary/20 border-border/60 hover:bg-secondary/40'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                permissions: { ...formData.permissions, [key]: e.target.checked },
                              })
                            }
                            className="mt-0.5 rounded border-border text-primary focus:ring-primary"
                          />
                          <div>
                            <p className="font-semibold text-foreground text-[11.5px] leading-tight">{label}</p>
                            <p className="text-[10.5px] text-muted-foreground line-clamp-1">{description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" leftIcon={<Check className="h-3.5 w-3.5" />}>
                    Create User & Grant Access
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 2. Modal: Edit User & Permissions */}
      {/* ============================================================ */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Edit User Access & Permissions</h3>
                    <p className="text-xs text-muted-foreground">{editingUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSavePermissions} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">User Name</label>
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      className="w-full bg-secondary/30 border border-border focus:border-primary rounded-lg px-3 py-2 text-xs text-foreground outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Department</label>
                    <input
                      type="text"
                      value={editingUser.department}
                      onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                      className="w-full bg-secondary/30 border border-border focus:border-primary rounded-lg px-3 py-2 text-xs text-foreground outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Security Role</label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => {
                        const newRole = e.target.value as UserRole;
                        setEditingUser({
                          ...editingUser,
                          role: newRole,
                          permissions: { ...ROLE_PRESET_PERMISSIONS[newRole] },
                        });
                      }}
                      className="w-full bg-secondary/30 border border-border focus:border-primary rounded-lg px-3 py-2 text-xs text-foreground outline-none cursor-pointer"
                    >
                      <option value="admin" className="bg-card text-foreground">Admin (Full Control)</option>
                      <option value="manager" className="bg-card text-foreground">Manager (Operations)</option>
                      <option value="analyst" className="bg-card text-foreground">Analyst (Insights & AI)</option>
                      <option value="viewer" className="bg-card text-foreground">Viewer (Read-Only)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Account Status</label>
                    <select
                      value={editingUser.status}
                      onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as 'active' | 'suspended' })}
                      className="w-full bg-secondary/30 border border-border focus:border-primary rounded-lg px-3 py-2 text-xs text-foreground outline-none cursor-pointer"
                    >
                      <option value="active" className="bg-card text-foreground">Active (Allowed to sign in)</option>
                      <option value="suspended" className="bg-card text-foreground">Suspended (Access blocked)</option>
                    </select>
                  </div>
                </div>

                {/* Granular Permissions Section */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">Fine-Tuned Access Permissions</label>
                    <span className="text-[11px] text-muted-foreground">Custom overrides for this account</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {PERMISSION_LABELS.map(({ key, label, description }) => {
                      const checked = !!editingUser.permissions[key];
                      return (
                        <label
                          key={key}
                          className={cn(
                            'flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors text-xs',
                            checked ? 'bg-primary/5 border-primary/30' : 'bg-secondary/20 border-border/60 hover:bg-secondary/40'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              setEditingUser({
                                ...editingUser,
                                permissions: { ...editingUser.permissions, [key]: e.target.checked },
                              })
                            }
                            className="mt-0.5 rounded border-border text-primary focus:ring-primary"
                          />
                          <div>
                            <p className="font-semibold text-foreground text-[11.5px] leading-tight">{label}</p>
                            <p className="text-[10.5px] text-muted-foreground line-clamp-1">{description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditingUser(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" leftIcon={<Check className="h-3.5 w-3.5" />}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ContentWrapper>
  );
}

export default UsersPage;
