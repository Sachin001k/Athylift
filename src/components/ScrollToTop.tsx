import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Single-page navigation keeps the old scroll position; start each new page at the top.
// Back/forward and in-page #anchors are left alone.
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};
