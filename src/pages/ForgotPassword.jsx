import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MailCheck } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { forgotPassword } from '@/services/api';

export default function ForgotPassword() {
  usePageMeta('استعادة كلمة المرور');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('البريد الإلكتروني غير صحيح');
      return;
    }
    setBusy(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="نسيت كلمة المرور؟" subtitle="اكتب بريدك وهنبعتلك رابط تعيّن بيه كلمة مرور جديدة.">
      {sent ? (
        <div className="rounded-2xl border border-line bg-surface p-6 text-center">
          <MailCheck className="mx-auto size-10 text-primary" aria-hidden="true" />
          <p className="mt-4 font-medium">لو البريد ده مسجل عندنا، هيوصلك رابط خلال دقايق.</p>
          <p className="mt-2 text-sm text-muted">بص على الـ Spam كمان. الرابط صالح لمدة ساعة.</p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-5">
          <Input label="البريد الإلكتروني" type="email" icon={Mail} dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} error={error} placeholder="name@example.com" />
          <Button type="submit" size="lg" className="w-full" loading={busy}>
            ابعت رابط الاستعادة
          </Button>
        </form>
      )}
      <p className="mt-8 text-center text-muted">
        افتكرتها؟{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </AuthShell>
  );
}
