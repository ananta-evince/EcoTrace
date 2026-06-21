'use client';

import {
  LayoutDashboard,
  PenLine,
  Zap,
  User,
  Leaf,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { cn } from '@/lib/utils';


const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/track', label: 'Track', icon: PenLine },
  { href: '/actions', label: 'Actions', icon: Zap },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <Leaf className="h-6 w-6 text-brand-600" aria-hidden="true" />
        <span className="font-display text-xl font-bold text-brand-800 dark:text-brand-300">
          EcoTrace
        </span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
                active
                  ? 'bg-brand-50 text-brand-800 dark:bg-brand-900/50 dark:text-brand-200'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 transition-all duration-200',
            'hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
          )}
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-gray-200 bg-white md:hidden dark:border-gray-800 dark:bg-gray-950"
      aria-label="Mobile navigation"
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2 text-xs',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500',
              active ? 'text-brand-700' : 'text-gray-500',
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
