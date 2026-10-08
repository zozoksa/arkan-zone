import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import ErrorState from '@/components/common/ErrorState';
import DataTable from '@/components/admin/DataTable';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { admin } from '@/services/api';
import { formatDate } from '@/utils/format';

const EMPTY = { code: '', percent: '', maxUses: '', expiresAt: '' };

export default function AdminCoupons() {
  usePageMeta('أكواد الخصم');
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => admin.coupons(), []);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await admin.createCoupon({
        code: form.code,
        percent: Number(form.percent),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59`).toISOString() : null,
      });
      setForm(EMPTY);
      toast({ title: 'اتعمل كود الخصم' });
      reload();
    } catch (err) {
      setErrors(err.details || { code: err.message });
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (c) => {
    try {
      await admin.setCouponActive(c.code, !c.active);
      reload();
    } catch (err) {
      toast({ title: err.message, variant: 'error' });
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`تمسح الكود ${c.code}؟`)) return;
    try {
      await admin.deleteCoupon(c.code);
      toast({ title: 'اتمسح الكود', variant: 'info' });
      reload();
    } catch (err) {
      toast({ title: 'مينفعش يتمسح', description: err.message, variant: 'error' });
    }
  };

  const expired = (c) => c.expiresAt && c.expiresAt < new Date().toISOString();
  const exhausted = (c) => c.maxUses != null && c.usedCount >= c.maxUses;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">أكواد الخصم</h1>
      <form onSubmit={create} noValidate className="grid gap-4 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr_0.8fr_1fr_auto] xl:items-end">
        <Input label="الكود" dir="ltr" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} error={errors.code} placeholder="RAMADAN30" />
        <Input label="نسبة الخصم %" type="number" min="1" max="100" value={form.percent} onChange={(e) => setForm({ ...form, percent: e.target.value })} error={errors.percent} />
        <Input label="أقصى استخدام" type="number" min="1" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} hint="فاضي = بلا حد" />
        <Input label="ينتهي في" type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
        <Button type="submit" loading={saving} className="xl:mb-0.5">
          إضافة كود
        </Button>
      </form>

      {loading ? (
        <Skeleton className="h-60 rounded-2xl" />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <DataTable
          rows={data}
          rowKey={(c) => c.code}
          empty="مفيش أكواد"
          columns={[
            { key: 'code', label: 'الكود', render: (c) => <span dir="ltr" className="font-medium text-ink">{c.code}</span> },
            { key: 'percent', label: 'الخصم', render: (c) => `${c.percent}%` },
            { key: 'usage', label: 'الاستخدام', render: (c) => `${c.usedCount}${c.maxUses != null ? ` / ${c.maxUses}` : ''}` },
            { key: 'expiresAt', label: 'ينتهي', render: (c) => (c.expiresAt ? formatDate(c.expiresAt) : 'بدون') },
            {
              key: 'state',
              label: 'الحالة',
              render: (c) =>
                !c.active ? <Badge>موقوف</Badge> : expired(c) ? <Badge tone="outline">منتهي</Badge> : exhausted(c) ? <Badge tone="outline">مستنفد</Badge> : <Badge tone="primary">فعال</Badge>,
            },
            {
              key: 'actions',
              label: '',
              render: (c) => (
                <span className="flex items-center justify-end gap-2">
                  <Button size="sm" variant="secondary" onClick={() => toggle(c)}>
                    {c.active ? 'إيقاف' : 'تفعيل'}
                  </Button>
                  <button type="button" onClick={() => remove(c)} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger" aria-label={`مسح ${c.code}`}>
                    <Trash2 className="size-4" />
                  </button>
                </span>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
