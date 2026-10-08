import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useLearning } from '@/context/LearningContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/cn';

export default function FavoriteButton({ courseId, variant = 'icon', className }) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useLearning();
  const toast = useToast();
  const [burst, setBurst] = useState(0);
  const [busy, setBusy] = useState(false);
  const active = isFavorite(courseId);

  const onClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({ title: 'سجّل دخولك الأول', description: 'عشان نحفظ الكورسات المفضلة في حسابك.', variant: 'info', action: { label: 'تسجيل الدخول', to: '/login' } });
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const added = await toggleFavorite(courseId);
      if (added) setBurst((n) => n + 1);
      toast({
        title: added ? 'اتضاف للمفضلة' : 'اتشال من المفضلة',
        variant: added ? 'success' : 'info',
        duration: 2200,
        action: added ? { label: 'عرض المفضلة', to: '/favorites' } : undefined,
      });
    } catch (error) {
      toast({ title: 'مقدرناش نحدّث المفضلة', description: error.message, variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const heart = (
    <Heart
      key={burst}
      className={cn('size-[18px] transition-colors', active ? 'animate-pop fill-danger text-danger' : 'text-current')}
      aria-hidden="true"
    />
  );

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cn(
          'inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface font-medium text-ink transition-colors hover:border-line-strong hover:bg-raised',
          className,
        )}
      >
        {heart}
        {active ? 'في المفضلة' : 'أضف إلى المفضلة'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
      className={cn(
        'grid size-9 place-items-center rounded-full bg-surface/90 text-ink-soft shadow-sm backdrop-blur transition hover:bg-surface hover:text-danger',
        className,
      )}
    >
      {heart}
    </button>
  );
}
