import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Logo from '@/components/common/Logo';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { accountNav, mainNav } from '@/data/navigation';
import { cn } from '@/utils/cn';

const linkClass = ({ isActive }) =>
  cn(
    'block rounded-xl px-4 py-3 text-[1.05rem] font-medium transition-colors',
    isActive ? 'bg-primary-soft text-primary' : 'text-ink-soft hover:bg-sunken hover:text-ink',
  );

export default function MobileMenu({ open, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <Modal open={open} onClose={onClose} variant="sheet" title={<Logo />}>
      <nav aria-label="القائمة الرئيسية" className="space-y-1">
        {mainNav.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={onClose}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {user ? (
        <div className="mt-6 border-t border-line pt-6">
          <div className="mb-3 flex items-center gap-3 px-2">
            <Avatar name={user.name} src={user.avatarUrl} />
            <div className="min-w-0">
              <p className="truncate font-medium">{user.name}</p>
              <p className="truncate text-sm text-muted" dir="ltr">
                {user.email}
              </p>
            </div>
          </div>
          {accountNav.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} onClick={onClose}>
              {item.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className={linkClass} onClick={onClose}>
              لوحة الإدارة
            </NavLink>
          )}
          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
              navigate('/');
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-4 py-3 font-medium text-danger hover:bg-danger-soft"
          >
            <LogOut className="size-4" aria-hidden="true" />
            تسجيل الخروج
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 border-t border-line pt-6">
          <Button to="/register" onClick={onClose}>
            إنشاء حساب
          </Button>
          <Button to="/login" variant="secondary" onClick={onClose}>
            تسجيل الدخول
          </Button>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between rounded-xl bg-sunken p-1.5">
        {[
          ['light', 'فاتح'],
          ['dark', 'داكن'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={theme === value}
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-medium transition',
              theme === value ? 'bg-surface text-ink shadow-sm' : 'text-muted',
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </Modal>
  );
}
