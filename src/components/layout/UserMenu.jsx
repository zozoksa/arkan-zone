import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronDown, Heart, LayoutDashboard, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';
import { accountNav } from '@/data/navigation';

const icons = { dashboard: LayoutDashboard, courses: BookOpen, favorites: Heart, profile: UserRound };

export default function UserMenu() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-xl py-1 ps-1 pe-2 transition-colors hover:bg-sunken"
      >
        <Avatar name={user.name} src={user.avatarUrl} size="sm" />
        <span className="hidden max-w-28 truncate text-sm font-medium text-ink xl:block">{user.name}</span>
        <ChevronDown className={`size-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute end-0 top-full z-50 mt-2 w-60 animate-scale-in rounded-2xl border border-line bg-surface p-2 shadow-pop">
          <div className="border-b border-line px-3 pb-3 pt-1">
            <p className="truncate font-medium text-ink">{user.name}</p>
            <p className="truncate text-sm text-muted" dir="ltr">
              {user.email}
            </p>
          </div>
          <div className="py-1.5">
            {accountNav.map((item) => {
              const Icon = icons[item.icon];
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-sunken hover:text-ink"
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to="/admin"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-sunken hover:text-ink"
              >
                <ShieldCheck className="size-4" aria-hidden="true" />
                لوحة الإدارة
              </Link>
            )}
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
              navigate('/');
            }}
            className="flex w-full items-center gap-3 rounded-lg border-t border-line px-3 py-2.5 text-sm text-danger hover:bg-danger-soft"
          >
            <LogOut className="size-4" aria-hidden="true" />
            تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
}
