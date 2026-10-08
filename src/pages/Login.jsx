import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, Sparkles } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usePageMeta } from '@/hooks/usePageMeta';

const DEMO = { email: 'demo@arkanzone.com', password: '123456' };

export default function Login() {
  usePageMeta('تسجيل الدخول');
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from || '/dashboard';
  const intent = location.state?.intent;

  if (user && !submitting) return <Navigate to={from} replace />;

  const validate = (values) => {
    const next = {};
    if (!values.email.trim()) next.email = 'اكتب بريدك الإلكتروني';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'البريد الإلكتروني غير صحيح';
    if (!values.password) next.password = 'اكتب كلمة المرور';
    return next;
  };

  const submit = async (values) => {
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSubmitting(true);
    try {
      const u = await login(values);
      toast({ title: `أهلًا بيك يا ${u.name.split(' ')[0]}` });
      navigate(from, { replace: true, state: intent ? { intent } : null });
    } catch (e) {
      setErrors({ form: e.message });
      setSubmitting(false);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <AuthShell title="أهلًا بيك تاني" subtitle="سجّل دخولك وكمّل من مكان ما وقفت.">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit(form);
        }}
        className="space-y-5"
      >
        {errors.form && (
          <p role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
            {errors.form}
          </p>
        )}
        <Input label="البريد الإلكتروني" type="email" icon={Mail} dir="ltr" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="name@example.com" />
        <Input label="كلمة المرور" type="password" icon={Lock} autoComplete="current-password" value={form.password} onChange={set('password')} error={errors.password} />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            نسيت كلمة المرور؟
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          تسجيل الدخول
        </Button>
        {(import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_LOGIN === 'true') && (
        <Button
          variant="soft"
          size="lg"
          className="w-full"
          disabled={submitting}
          onClick={() => {
            setForm(DEMO);
            submit(DEMO);
          }}
        >
          <Sparkles className="size-4" aria-hidden="true" />
          الدخول بالحساب التجريبي
        </Button>
        )}
      </form>
      <p className="mt-8 text-center text-muted">
        معندكش حساب؟{' '}
        <Link to="/register" state={location.state} className="font-medium text-primary hover:underline">
          إنشاء حساب
        </Link>
      </p>
    </AuthShell>
  );
}
