import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function ResetPassword() {
  usePageMeta('تعيين كلمة مرور جديدة');
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const { resetPassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.password.length < 6) next.password = 'كلمة المرور لازم تكون 6 حروف على الأقل';
    if (form.confirm !== form.password) next.confirm = 'كلمتين المرور مش متطابقين';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await resetPassword(token, form.password);
      toast({ title: 'تم تغيير كلمة المرور', description: 'ودخلناك على حسابك.' });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrors({ form: err.message });
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <AuthShell title="الرابط ناقص" subtitle="افتح الرابط اللي وصلك على البريد كامل، أو اطلب رابط جديد.">
        <Button to="/forgot-password">اطلب رابط جديد</Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="كلمة مرور جديدة" subtitle="اختار كلمة مرور قوية متستخدمهاش في مواقع تانية.">
      <form onSubmit={submit} noValidate className="space-y-5">
        {errors.form && (
          <p role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
            {errors.form}{' '}
            <Link to="/forgot-password" className="font-medium underline">
              اطلب رابط جديد
            </Link>
          </p>
        )}
        <Input label="كلمة المرور الجديدة" type="password" icon={Lock} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />
        <Input label="تأكيد كلمة المرور" type="password" icon={Lock} autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} error={errors.confirm} />
        <Button type="submit" size="lg" className="w-full" loading={busy}>
          حفظ كلمة المرور
        </Button>
      </form>
    </AuthShell>
  );
}
