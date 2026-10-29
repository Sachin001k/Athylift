import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Team-kit colour pairs; each person always gets the same one.
const GRADIENTS = [
  'from-orange-500 to-red-600',
  'from-sky-500 to-blue-700',
  'from-emerald-500 to-teal-700',
  'from-violet-500 to-indigo-700',
  'from-amber-400 to-orange-600',
  'from-rose-500 to-pink-700',
  'from-cyan-500 to-sky-700',
  'from-lime-500 to-green-700',
];

const hash = (value: string) => {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export const initialsOf = (name: string | null | undefined) => {
  const words = (name || '').replace(/@.*/, '').split(/[\s._-]+/).filter(Boolean);
  if (words.length === 0) return 'A';
  return ((words[0][0] || '') + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase();
};

interface UserAvatarProps {
  id?: string | null;
  name?: string | null;
  url?: string | null;
  // Size and shape classes, e.g. "h-10 w-10" or "h-28 w-28 border-4 border-base-100".
  className?: string;
  textClassName?: string;
}

// Uploaded photo when there is one, otherwise the person's initials on a coloured badge.
export const UserAvatar = ({ id, name, url, className = 'h-10 w-10', textClassName = 'text-sm' }: UserAvatarProps) => {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [url]);

  if (url && !broken) {
    return (
      <img
        src={url}
        alt={name ? `${name}'s photo` : ''}
        onError={() => setBroken(true)}
        className={cn('shrink-0 rounded-full object-cover bg-base-200', className)}
      />
    );
  }

  return (
    <div
      aria-label={name || undefined}
      role={name ? 'img' : undefined}
      className={cn(
        'shrink-0 rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-white select-none',
        GRADIENTS[hash(id || name || 'athylift') % GRADIENTS.length],
        className,
      )}
    >
      <span className={textClassName}>{initialsOf(name)}</span>
    </div>
  );
};
