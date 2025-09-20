
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/plans', label: 'Plans' },
  { href: '/admin/addons', label: 'Add-ons' },
  { href: '/admin/promotions', label: 'Promotions' },
  { href: '/admin/linking', label: 'Linking' },
  { href: '/admin/orders', label: 'Orders' },
];

export default function AdminShell({ children }:{ children: React.ReactNode }){
  const pathname = usePathname();
  return (
    <div className="min-h-screen flex">
      <aside className="sidebar">
        <div className="p-4 border-b dark:border-gray-800">
          <div className="text-lg font-semibold"><span className="text-brand">RP Studios</span> Admin</div>
        </div>
        <nav className="p-2 space-y-1">
          {NAV.map(item => (
            <Link key={item.href} href={item.href} className={`navlink ${pathname===item.href?'bg-gray-100 dark:bg-gray-800':''}`}>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <div className="topbar border-b dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">RP Studios — Admin</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
        <main className="max-w-6xl mx-auto p-4">{children}</main>
      </div>
    </div>
  );
}
