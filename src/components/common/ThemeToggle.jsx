import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="grid size-10 place-items-center rounded-xl text-ink-soft transition-colors hover:bg-sunken hover:text-ink"
      aria-label={dark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
      title={dark ? 'الوضع الفاتح' : 'الوضع الداكن'}
    >
      <span key={theme} className="animate-scale-in">
        {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </span>
    </button>
  );
}
