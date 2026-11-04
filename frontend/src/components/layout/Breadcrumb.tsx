import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils';
import { SIDEBAR_NAV } from '@/constants';

// ============================================================
// Breadcrumb Component
// ============================================================

interface BreadcrumbItem {
  label: string;
  href?: string;
}

function buildBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

  if (pathname === '/') return crumbs;

  const segments = pathname.split('/').filter(Boolean);
  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const isLast = i === segments.length - 1;

    // Try to match against sidebar nav
    const allNavItems = SIDEBAR_NAV.flatMap((g) => g.items);
    const navItem = allNavItems.find((item) => item.href === currentPath);

    if (navItem) {
      crumbs.push({ label: navItem.label, href: isLast ? undefined : currentPath });
    } else {
      // Format segment as label
      const label = segments[i].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      crumbs.push({ label, href: isLast ? undefined : currentPath });
    }
  }

  return crumbs;
}

export function Breadcrumb({ className }: { className?: string }) {
  const location = useLocation();
  const crumbs = buildBreadcrumbs(location.pathname);

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm', className)}>
      {crumbs.map((crumb, index) => (
        <React.Fragment key={crumb.href ?? crumb.label}>
          {index === 0 ? (
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-3.5 w-3.5" />
            </Link>
          ) : crumb.href ? (
            <Link
              to={crumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{crumb.label}</span>
          )}
          {index < crumbs.length - 1 && (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export default Breadcrumb;
