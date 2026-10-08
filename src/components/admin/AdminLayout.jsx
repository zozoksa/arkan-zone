import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, MessageSquare, Receipt, TicketPercent, Users } from 'lucide-react';
import { cn } from '@/utils/cn';

const links = [
  { to: '/admin', label: 'نظرة عامة', icon: BarChart3, end: true },
  { to: '/admin/orders', label: 'الطلبات', icon: Receipt },
  { to: '/admin/users', label: 'المستخدمين', icon: Users },
  { to: '/admin/coupons', label: 'أكواد الخصم', icon: TicketPercent },
  { to: '/admin/messages', label: 'الرسائل', icon: MessageSquare },
];

export default function AdminLayout() {
  return (
    <div className="container-page py-8 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside>
          <p className="mb-3 px-3 text-sm font-semibold text-muted">لوحة الإدارة</p>
          <nav aria-label="أقسام الإدارة" className="scrollbar-none flex gap-1 overflow-x-auto lg:flex-col">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-primary-soft text-primary' : 'text-ink-soft hover:bg-sunken hover:text-ink',
                  )
                }
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
