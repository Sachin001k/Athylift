import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Accent colours for the default cover; each person always gets the same one.
const ACCENTS = ['#FF6B1A', '#38BDF8', '#34D399', '#A78BFA', '#FBBF24', '#F472B6'];

const hash = (value: string) => {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h);
};

interface CoverArtProps {
  url?: string | null;
  seed?: string | null;
  className?: string;
}

// The uploaded cover photo, or a branded running-track graphic when there isn't one.
export const CoverArt = ({ url, seed, className }: CoverArtProps) => {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [url]);

  if (url && !broken) {
    return <img src={url} alt="" onError={() => setBroken(true)} className={cn('h-full w-full object-cover', className)} />;
  }

  const accent = ACCENTS[hash(seed || 'athylift') % ACCENTS.length];
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-gradient-to-br from-[#0F1E3D] via-[#1C3366] to-[#0F1E3D]', className)} aria-hidden="true">
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{ backgroundImage: 'repeating-linear-gradient(115deg, #fff 0 2px, transparent 2px 70px)' }}
      />
      <svg viewBox="0 0 1200 260" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        {[0, 1, 2, 3, 4, 5].map((lane) => (
          <path
            key={lane}
            d={`M -50 ${300 - lane * 34} C 300 ${240 - lane * 30}, 700 ${120 - lane * 20}, 1250 ${150 - lane * 26}`}
            fill="none"
            stroke={lane === 2 ? accent : 'rgba(255,255,255,0.18)'}
            strokeWidth={lane === 2 ? 6 : 2}
            strokeDasharray={lane === 2 ? undefined : '14 12'}
            strokeLinecap="round"
          />
        ))}
        <circle cx="1080" cy="70" r="120" fill={accent} opacity="0.12" />
        <circle cx="1080" cy="70" r="70" fill={accent} opacity="0.12" />
      </svg>
    </div>
  );
};
