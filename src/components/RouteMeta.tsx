import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyPageMeta, PageMeta } from '@/lib/seo';

// Title and description for each fixed route. Athlete and request pages set their own once loaded.
const ROUTES: Record<string, Omit<PageMeta, 'path'>> = {
  '/': {},
  '/athletes': {
    title: 'Explore athletes',
    description: 'Discover athletes on Athylift, their achievements, goals and the support they need to keep competing.',
  },
  '/feed': { title: 'Athlete feed', description: 'Training updates, achievements and funding requests from athletes on Athylift.' },
  '/requests': {
    title: 'Funding requests',
    description: 'Equipment, coaching, training and academy fees that athletes on Athylift need help funding.',
  },
  '/how-it-works': {
    title: 'How it works',
    description: 'Athletes share their stories and funding needs; donors discover them and help close the gap. Here is how Athylift works.',
  },
  '/about': { title: 'About', description: 'Athylift exists to make sporting opportunities accessible to athletes facing financial barriers.' },
  '/faq': { title: 'FAQ', description: 'Answers for athletes and donors about Athylift, support requests, pledges and privacy.' },
  '/contact': { title: 'Contact', description: 'Get in touch with the Athylift team.' },
  '/pricing': { title: 'Free for athletes and donors' },
  '/terms': { title: 'Terms & conditions' },
  '/privacy': { title: 'Privacy policy' },
  '/disclaimer': { title: 'Disclaimer' },
  '/login': { title: 'Log in', noindex: true },
  '/register': { title: 'Sign up', description: 'Join Athylift as an athlete looking for support or as a donor.' },
  '/forgot-password': { title: 'Reset password', noindex: true },
  '/reset-password': { title: 'Choose a new password', noindex: true },
  '/onboarding': { title: 'Set up your profile', noindex: true },
  '/dashboard': { title: 'Dashboard', noindex: true },
  '/profile': { title: 'Account', noindex: true },
  '/donations': { title: 'My support', noindex: true },
  '/add-post': { title: 'Share an update', noindex: true },
  '/my-posts': { title: 'My posts', noindex: true },
  '/requests/new': { title: 'Post a support request', noindex: true },
};

export const RouteMeta = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const known = ROUTES[pathname];
    if (known) {
      applyPageMeta({ ...known, path: pathname });
    } else if (/^\/requests\/[^/]+\/edit$/.test(pathname)) {
      applyPageMeta({ title: 'Edit support request', path: pathname, noindex: true });
    } else if (!/^\/(athletes|requests)\/[^/]+$/.test(pathname)) {
      // Unknown path: the 404 page.
      applyPageMeta({ title: 'Page not found', path: pathname, noindex: true });
    }
  }, [pathname]);
  return null;
};
