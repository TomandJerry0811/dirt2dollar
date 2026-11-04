import {
  LayoutDashboard,
  Users,
  BarChart3,
  Brain,
  History,
  Lightbulb,
  GitBranch,
  FileText,
  Settings,
  Coins,
  ShieldCheck,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from './routes.constants';

// ============================================================
// Sidebar Navigation Types
// ============================================================

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string | number;
  badgeVariant?: 'default' | 'destructive' | 'warning';
  description?: string;
}

export interface SidebarNavGroup {
  id: string;
  label?: string;
  items: SidebarNavItem[];
}

// ============================================================
// Sidebar Navigation Config
// ============================================================

export const SIDEBAR_NAV: SidebarNavGroup[] = [
  {
    id: 'main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: ROUTES.DASHBOARD,
        description: 'Overview & metrics',
      },
      {
        id: 'clients',
        label: 'Clients',
        icon: Users,
        href: ROUTES.CLIENTS,
        description: 'Manage client accounts',
      },
    ],
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    items: [
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        href: ROUTES.ANALYTICS,
        description: 'Data & insights',
      },
      {
        id: 'ai-analysis',
        label: 'AI Analysis',
        icon: Brain,
        href: '/ai-analysis',
        description: 'AI-driven predictions',
      },
      {
        id: 'ai-usage',
        label: 'AI Usage',
        icon: Coins,
        href: ROUTES.AI_USAGE,
        description: 'Token consumption & logs',
      },
      {
        id: 'historical',
        label: 'Historical Clients',
        icon: History,
        href: '/historical',
        description: 'Past client data',
      },
      {
        id: 'recommendations',
        label: 'Recommendations',
        icon: Lightbulb,
        href: ROUTES.RECOMMENDATIONS,
        description: 'AI recommendations',
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      {
        id: 'workflow',
        label: 'Workflow Monitor',
        icon: GitBranch,
        href: ROUTES.WORKFLOW,
        description: 'Automation workflows',
      },
      {
        id: 'error-logs',
        label: 'Error Logs',
        icon: AlertTriangle,
        href: ROUTES.ERROR_LOGS,
        description: 'Failed steps & error tracking',
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: FileText,
        href: ROUTES.REPORTS,
        description: 'Export & reporting',
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      {
        id: 'users',
        label: 'Users & Access',
        icon: ShieldCheck,
        href: ROUTES.USERS,
        description: 'Team permissions & roles',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        href: ROUTES.SETTINGS,
        description: 'Account & preferences',
      },
    ],
  },
];

// Sidebar footer info
export const SIDEBAR_FOOTER = {
  version: '1.0.0',
  company: 'Customer Churn Predictor',
  supportUrl: 'https://support.churnpredictor.ai',
};
