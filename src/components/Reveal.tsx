import { ElementType, ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  // Stagger siblings, in milliseconds.
  delay?: number;
}

// Fades and lifts content in the first time it scrolls into view (see .reveal in index.css).
export const Reveal = ({ children, as: Tag = 'div', className, delay = 0 }: RevealProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={cn('reveal', visible && 'is-visible', className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
};
