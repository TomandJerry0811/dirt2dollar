import * as React from 'react';
import { cn } from '@/utils';

// ============================================================
// Avatar Component — Enterprise Design System
// ============================================================

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
  alt?: string;
}

const sizeMap: Record<AvatarSize, { container: string; text: string }> = {
  xs: { container: 'h-6 w-6',   text: 'text-[9px]' },
  sm: { container: 'h-7 w-7',   text: 'text-[10px]' },
  md: { container: 'h-8 w-8',   text: 'text-[11px]' },
  lg: { container: 'h-10 w-10', text: 'text-[13px]' },
  xl: { container: 'h-12 w-12', text: 'text-[15px]' },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Deterministic color from name — uses HSL palette
function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-violet-100 text-violet-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
    'bg-indigo-100 text-indigo-700',
    'bg-teal-100 text-teal-700',
  ];
  const index = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

export function Avatar({ name = 'User', src, size = 'md', className, alt }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const { container, text } = sizeMap[size];
  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={alt ?? name}
        onError={() => setImgError(true)}
        className={cn('avatar object-cover', container, className)}
      />
    );
  }

  return (
    <div
      className={cn('avatar', colorClass, container, className)}
      aria-label={name}
      role="img"
      title={name}
    >
      <span className={cn('font-semibold select-none', text)}>{initials}</span>
    </div>
  );
}

// ============================================================
// AvatarGroup — stack of avatars
// ============================================================

interface AvatarGroupProps {
  items: Array<{ name: string; src?: string }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({ items, max = 4, size = 'sm', className }: AvatarGroupProps) {
  const visible = items.slice(0, max);
  const overflow = items.length - max;

  return (
    <div className={cn('flex items-center', className)}>
      {visible.map((item, i) => (
        <Avatar
          key={i}
          name={item.name}
          src={item.src}
          size={size}
          className={cn('-ml-2 first:ml-0 ring-2 ring-card')}
        />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            'avatar -ml-2 ring-2 ring-card',
            'bg-secondary text-muted-foreground',
            sizeMap[size].container,
            sizeMap[size].text
          )}
          aria-label={`+${overflow} more`}
          title={`+${overflow} more`}
        >
          <span className="font-semibold select-none">+{overflow}</span>
        </div>
      )}
    </div>
  );
}

export default Avatar;
