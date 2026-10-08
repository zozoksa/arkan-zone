import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Camera, Lock, LogOut, Mail, MailWarning, Monitor, Moon, Receipt, Sun, UserRound } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { changePassword, getMyOrders, resendVerification } from '@/services/api';
import { storage, STORAGE_KEYS } from '@/services/storage';
import { formatDate, formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';

const themeOptions = [
  { value: 'light', label: 'فاتح', icon: Sun },
  { value: 'dark', label: 'داكن', icon: Moon },
  { value: 'system', label: 'حسب الجهاز', icon: Monitor },
];

const notificationOptions = [
  { key: 'newCourses', label: 'كورسات جديدة في اهتماماتي', hint: 'رسالة لما ينزل كورس في مجال بتتابعه' },
  { key: 'reminders', label: 'تذكير بالتعلم', hint: 'تذكير يومي لو مفتحتش أي درس' },
  { key: 'offers', label: 'العروض والخصومات', hint: 'مرة في الشهر بحد أقصى' },
];

const statusTone = { paid: ['primary', 'مدفوع'], pending: ['accent', 'قيد التأكيد'], failed: ['neutral', 'فشل'], refunded: ['outline', 'مسترد'] };

function Card({ title, description, children, id }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span>
        <span className="block font-medium text-ink">{label}</span>
        <span className="block text-sm text-muted">{hint}</span>
      </span>
      <span className="relative inline-flex">
        <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-line-strong transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2" />
        <span className="absolute start-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:-translate-x-5" />
      </span>
    </label>
  );
}

function PasswordForm() {
  const toast = useToast();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!form.current) found.current = 'اكتب كلمة المرور الحالية';
    if (form.next.length < 6) found.next = 'كلمة المرور لازم تكون 6 حروف على الأقل';
    if (form.confirm !== form.next) found.confirm = 'كلمتين المرور مش متطابقين';
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await changePassword(form.current, form.next);
      setForm({ current: '', next: '', confirm: '' });
      toast({ title: 'تم تغيير كلمة المرور' });
    } catch (err) {
      setErrors({ current: err.details?.currentPassword || err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Input label="كلمة المرور الحالية" type="password" icon={Lock} autoComplete="current-password" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} error={errors.current} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="كلمة المرور الجديدة" type="password" icon={Lock} autoComplete="new-password" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} error={errors.next} />
        <Input label="تأكيد كلمة المرور" type="password" icon={Lock} autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} error={errors.confirm} />
      </div>
      <Button type="submit" variant="secondary" loading={busy}>
        تغيير كلمة المرور
      </Button>
    </form>
  );
}

function Orders() {
  const { data, loading, error, reload } = useAsync(() => getMyOrders(), []);
  if (loading) return <Skeleton className="h-24 rounded-xl" />;
  if (error) {
    return (
      <p className="text-sm text-danger">
        {error.message}{' '}
        <button type="button" onClick={reload} className="underline">
          إعادة المحاولة
        </button>
      </p>
    );
  }
  if (!data.length) return <p className="rounded-xl bg-raised p-4 text-sm text-muted">مفيش مشتريات لسه.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] text-sm">
        <thead>
          <tr className="border-b border-line text-start text-muted">
            <th className="py-2 text-start font-medium">الكورس</th>
            <th className="py-2 text-start font-medium">التاريخ</th>
            <th className="py-2 text-start font-medium">المبلغ</th>
            <th className="py-2 text-start font-medium">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {data.map((o) => {
            const [tone, label] = statusTone[o.status] || ['neutral', o.status];
            return (
              <tr key={o.id} className="border-b border-line/70 last:border-0">
                <td className="py-3 pe-3 text-ink">{o.courseTitle}</td>
                <td className="py-3 pe-3 text-muted">{formatDate(o.createdAt)}</td>
                <td className="py-3 pe-3">
                  {formatPrice(o.amount)}
                  {o.coupon && <span className="ms-1 text-xs text-muted">({o.coupon})</span>}
                </td>
                <td className="py-3">
                  <Badge tone={tone}>{label}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Profile() {
  usePageMeta('الملف الشخصي');
  const { user, updateProfile, uploadAvatar, logout } = useAuth();
  const { preference, setTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState({ name: user.name, email: user.email, bio: user.bio || '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resending, setResending] = useState(false);
  const [settings, setSettings] = useState(() =>
    storage.get(STORAGE_KEYS.settings, { newCourses: true, reminders: true, offers: false }),
  );

  const dirty = form.name !== user.name || form.email !== user.email || form.bio !== (user.bio || '');

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const updated = await updateProfile({ name: form.name.trim(), email: form.email.trim(), bio: form.bio.trim() });
      toast({
        title: 'تم حفظ التغييرات',
        description: !updated.emailVerified && form.email !== user.email ? 'بعتنالك رابط تأكيد على البريد الجديد.' : undefined,
      });
    } catch (err) {
      setErrors(err.details || {});
      toast({ title: 'مقدرناش نحفظ التغييرات', description: err.message, variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const onAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'الصورة أكبر من 2 ميجا', variant: 'error' });
      return;
    }
    setUploading(true);
    try {
      await uploadAvatar(file);
      toast({ title: 'اتغيرت صورتك' });
    } catch (err) {
      toast({ title: 'مقدرناش نرفع الصورة', description: err.message, variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await resendVerification();
      toast({ title: 'بعتنا رابط التأكيد', description: `على ${user.email}` });
    } catch (err) {
      toast({ title: 'مقدرناش نبعت الرابط', description: err.message, variant: 'error' });
    } finally {
      setResending(false);
    }
  };

  const updateSetting = (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    storage.set(STORAGE_KEYS.settings, next);
  };

  return (
    <div className="container-page py-10 sm:py-12">
      {!user.emailVerified && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-accent/40 bg-accent-soft px-5 py-4">
          <MailWarning className="size-5 text-accent" aria-hidden="true" />
          <p className="flex-1 text-sm text-ink-soft">
            بريدك <span dir="ltr">{user.email}</span> لسه ما اتأكدش. أكّده عشان توصلك الإيصالات والشهادات.
          </p>
          <Button size="sm" variant="secondary" onClick={resend} loading={resending}>
            ابعت رابط التأكيد تاني
          </Button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-line bg-surface p-6 text-center lg:sticky lg:top-24">
          <div className="relative mx-auto w-fit">
            <Avatar name={user.name} src={user.avatarUrl} size="xl" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 end-0 grid size-9 place-items-center rounded-full border-2 border-surface bg-primary text-on-primary shadow transition hover:bg-primary-hover disabled:opacity-60"
              aria-label="تغيير الصورة الشخصية"
            >
              <Camera className="size-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onAvatar} tabIndex={-1} />
          </div>
          <h1 className="mt-4 text-xl font-bold">{user.name}</h1>
          {user.role === 'admin' && <Badge tone="primary" className="mt-2">مدير</Badge>}
          <ul className="mt-4 space-y-2 text-start text-sm text-ink-soft">
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-muted" aria-hidden="true" />
              <span dir="ltr" className="truncate">
                {user.email}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted" aria-hidden="true" />
              انضم في {formatDate(user.joinedAt || new Date().toISOString())}
            </li>
          </ul>
          <Button
            variant="danger"
            className="mt-6 w-full"
            onClick={() => {
              logout();
              toast({ title: 'تم تسجيل الخروج', variant: 'info' });
              navigate('/');
            }}
          >
            <LogOut className="size-4" aria-hidden="true" />
            تسجيل الخروج
          </Button>
        </aside>

        <div className="min-w-0 space-y-6">
          <Card title="البيانات الشخصية" description="البيانات دي بتظهر في شهاداتك وفي تقييماتك للكورسات.">
            <form onSubmit={save} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="الاسم" icon={UserRound} value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input label="البريد الإلكتروني" type="email" icon={Mail} dir="ltr" value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <Input
                as="textarea"
                label="نبذة عنك"
                hint={`${form.bio.length}/280`}
                maxLength={280}
                value={form.bio}
                error={errors.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="مثال: طالب حاسبات مهتم بتطوير الويب"
              />
              <div className="flex gap-3">
                <Button type="submit" loading={saving} disabled={!dirty}>
                  حفظ التغييرات
                </Button>
                {dirty && (
                  <Button variant="ghost" onClick={() => setForm({ name: user.name, email: user.email, bio: user.bio || '' })}>
                    إلغاء
                  </Button>
                )}
              </div>
            </form>
          </Card>

          <Card id="orders" title="مشترياتي" description="كل طلباتك وحالة الدفع.">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Receipt className="size-4" aria-hidden="true" />
              الإيصالات بتوصل على بريدك بعد كل عملية دفع ناجحة.
            </div>
            <div className="mt-4">
              <Orders />
            </div>
          </Card>

          <Card title="كلمة المرور">
            <PasswordForm />
          </Card>

          <Card title="المظهر" description="اختار شكل الواجهة المريح ليك.">
            <div role="radiogroup" aria-label="المظهر" className="grid grid-cols-3 gap-3">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={preference === value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors',
                    preference === value ? 'border-primary bg-primary-soft text-primary' : 'border-line text-ink-soft hover:border-line-strong',
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </Card>

          <Card title="الإشعارات" description="بنبعت بس اللي يهمك.">
            <div className="divide-y divide-line">
              {notificationOptions.map((opt) => (
                <Toggle key={opt.key} label={opt.label} hint={opt.hint} checked={Boolean(settings[opt.key])} onChange={(v) => updateSetting(opt.key, v)} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
