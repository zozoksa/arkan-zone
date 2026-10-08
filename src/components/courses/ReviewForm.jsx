import { useState } from 'react';
import { Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { addReview } from '@/services/api';
import { cn } from '@/utils/cn';

const labels = ['', 'ضعيف', 'مقبول', 'كويس', 'كويس جدًا', 'ممتاز'];

export default function ReviewForm({ courseId, onSubmitted }) {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!rating) next.rating = 'اختار عدد النجوم';
    if (comment.trim().length < 5) next.comment = 'اكتب رأيك في 5 حروف على الأقل';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      await addReview(courseId, { rating, comment: comment.trim() });
      toast({ title: 'شكرًا على تقييمك' });
      onSubmitted?.();
    } catch (err) {
      setErrors(err.details || { form: err.message });
    } finally {
      setSaving(false);
    }
  };

  const shown = hover || rating;
  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-surface p-5" noValidate>
      <p className="font-medium text-ink">قيّم الكورس</p>
      <div className="mt-3 flex items-center gap-3">
        <div role="radiogroup" aria-label="التقييم" className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} من 5`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className="rounded-md p-0.5 transition-transform hover:scale-110"
            >
              <Star className={cn('size-7', n <= shown ? 'fill-accent text-accent' : 'fill-sunken text-line-strong')} />
            </button>
          ))}
        </div>
        <span className="text-sm text-muted">{labels[shown]}</span>
      </div>
      {errors.rating && <p className="mt-1 text-sm text-danger">{errors.rating}</p>}
      <Input
        as="textarea"
        label="رأيك في الكورس"
        className="mt-4"
        value={comment}
        maxLength={1000}
        onChange={(e) => setComment(e.target.value)}
        error={errors.comment}
        placeholder="إيه أكتر حاجة استفدت منها؟"
      />
      {errors.form && <p className="mt-2 text-sm text-danger">{errors.form}</p>}
      <Button type="submit" className="mt-4" loading={saving}>
        نشر التقييم
      </Button>
    </form>
  );
}
