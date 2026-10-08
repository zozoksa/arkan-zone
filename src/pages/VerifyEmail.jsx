import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { verifyEmail } from '@/services/api';

export default function VerifyEmail() {
  usePageMeta('تأكيد البريد الإلكتروني');
  const [params] = useSearchParams();
  const token = params.get('token');
  const { user, refreshUser } = useAuth();
  const [state, setState] = useState(token ? 'loading' : 'error');
  const [message, setMessage] = useState('الرابط ناقص.');

  useEffect(() => {
    if (!token) return;
    verifyEmail(token)
      .then(() => {
        setState('done');
        if (user) refreshUser().catch(() => {});
      })
      .catch((e) => {
        setMessage(e.message);
        setState('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="container-page flex min-h-[65vh] items-center justify-center py-12">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-line bg-surface p-8 text-center">
        {state === 'loading' && <Loader2 className="size-12 animate-spin text-primary" aria-label="جاري التأكيد" />}
        {state === 'done' && (
          <>
            <CheckCircle2 className="size-14 text-primary" aria-hidden="true" />
            <h1 className="text-2xl font-bold">تم تأكيد بريدك</h1>
            <p className="text-muted">كده حسابك جاهز بالكامل.</p>
            <Button to={user ? '/dashboard' : '/login'}>{user ? 'لوحة التحكم' : 'تسجيل الدخول'}</Button>
          </>
        )}
        {state === 'error' && (
          <>
            <XCircle className="size-14 text-danger" aria-hidden="true" />
            <h1 className="text-2xl font-bold">مقدرناش نأكد البريد</h1>
            <p className="text-muted">{message} تقدر تطلب رابط جديد من ملفك الشخصي.</p>
            <Button to="/profile" variant="secondary">
              الملف الشخصي
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
