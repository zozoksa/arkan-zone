import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import Logo from '@/components/common/Logo';
import ThemeToggle from '@/components/common/ThemeToggle';
import SearchDialog from '@/components/common/SearchDialog';
import Button from '@/components/ui/Button';
import UserMenu from './UserMenu';
import MobileMenu from './MobileMenu';
import NotificationBell from './NotificationBell';
import { useAuth } from '@/context/AuthContext';
import { useScrolled } from '@/hooks/useScrolled';
import { mainNav } from '@/data/navigation';
import { cn } from '@/utils/cn';

export default function Navbar() {
  const scrolled = useScrolled(12);
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setMenuOpen(false), [pathname]);

  // "/" or Ctrl/⌘+K opens search
  useEffect(() => {
    const onKey = (e) => {
      const typing = /input|textarea|select/i.test(document.activeElement?.tagName);
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        تخطي إلى المحتوى
      </a>
      <header
        className={cn(
          'sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300',
          scrolled
            ? 'border-line bg-canvas/80 shadow-[0_8px_24px_-20px_rgb(var(--shadow-color)/0.4)] backdrop-blur-xl'
            : 'border-transparent bg-canvas',
        )}
      >
        <div className={cn('container-page flex items-center gap-4 transition-[height] duration-300', scrolled ? 'h-16' : 'h-[4.5rem]')}>
          <Logo />

          <nav aria-label="القائمة الرئيسية" className="ms-6 hidden lg:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'relative rounded-lg px-3.5 py-2 text-[0.95rem] font-medium transition-colors',
                        isActive ? 'text-ink' : 'text-muted hover:text-ink',
                        isActive && 'after:absolute after:inset-x-3.5 after:-bottom-[1px] after:h-0.5 after:rounded-full after:bg-primary',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ms-auto flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden h-10 items-center gap-2 rounded-xl border border-line bg-surface ps-3 pe-2 text-sm text-muted transition-colors hover:border-line-strong md:flex"
              aria-label="بحث"
            >
              <Search className="size-4" aria-hidden="true" />
              <span>بحث</span>
              <kbd className="ms-4 rounded-md border border-line bg-sunken px-1.5 font-sans text-xs" dir="ltr">
                /
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid size-10 place-items-center rounded-xl text-ink-soft hover:bg-sunken md:hidden"
              aria-label="بحث"
            >
              <Search className="size-5" />
            </button>
            <ThemeToggle />
            {user && <NotificationBell />}

            {user ? (
              <div className="hidden lg:block">
                <UserMenu />
              </div>
            ) : (
              <div className="hidden items-center gap-2 lg:flex">
                <Button to="/login" variant="ghost" size="sm" className="h-10">
                  تسجيل الدخول
                </Button>
                <Button to="/register" size="sm" className="h-10 px-4">
                  إنشاء حساب
                </Button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid size-10 place-items-center rounded-xl text-ink hover:bg-sunken lg:hidden"
              aria-label="فتح القائمة"
              aria-expanded={menuOpen}
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
