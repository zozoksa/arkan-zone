import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, UserRound } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function Register() {
  usePageMeta('إنشاء حساب');
  const { user, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', terms: false });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from || '/dashboard';
  const intent = location.state?.intent;

  if (user && !submitting) return <Navigate to={from} replace />;

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'اكتب اسمك (حرفين على الأقل)';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'البريد الإلكتروني غير صحيح';
    if (form.password.length < 6) next.password = 'كلمة المرور لازم تكون 6 حروف على الأقل';
    if (form.confirm !== form.password) next.confirm = 'كلمتين المرور مش متطابقين';
    if (!form.terms) next.terms = 'لازم توافق على الشروط عشان تكمل';
    return next;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;
    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      toast({ title: 'تم إنشاء حسابك', description: 'يلا نبدأ أول كورس.' });
      navigate(from, { replace: true, state: intent ? { intent } : null });
    } catch (err) {
      setErrors({ form: err.message, ...(err.details || {}) });
      setSubmitting(false);
    }
  };

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <AuthShell title="ابدأ رحلتك" subtitle="اعمل حسابك المجاني في أقل من دقيقة.">
      <form noValidate onSubmit={onSubmit} className="space-y-5">
        {errors.form && (
          <p role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
            {errors.form}
          </p>
        )}
        <Input label="الاسم بالكامل" icon={UserRound} autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
        <Input label="البريد الإلكتروني" type="email" icon={Mail} dir="ltr" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="name@example.com" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="كلمة المرور" type="password" icon={Lock} autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} />
          <Input label="تأكيد كلمة المرور" type="password" icon={Lock} autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        </div>
        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
            <input type="checkbox" checked={form.terms} onChange={set('terms')} className="mt-1 size-4 accent-[var(--primary)]" aria-invalid={Boolean(errors.terms) || undefined} />
            <span>
              موافق على{' '}
              <Link to="/terms" className="text-primary hover:underline">
                الشروط والأحكام
              </Link>{' '}
              و
              <Link to="/privacy" className="text-primary hover:underline">
                سياسة الخصوصية
              </Link>
            </span>
          </label>
          {errors.terms && <p className="mt-1.5 text-sm text-danger">{errors.terms}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          إنشاء حساب
        </Button>
      </form>
      <p className="mt-8 text-center text-muted">
        عندك حساب؟{' '}
        <Link to="/login" state={location.state} className="font-medium text-primary hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </AuthShell>
  );
}
