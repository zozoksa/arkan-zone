import { useEffect, useState } from 'react';
import ErrorState from '@/components/common/ErrorState';
import SearchBar from '@/components/common/SearchBar';
import DataTable from '@/components/admin/DataTable';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { admin } from '@/services/api';
import { formatDate } from '@/utils/format';

export default function AdminUsers() {
  usePageMeta('المستخدمين');
  const { user: me } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, loading, error, reload } = useAsync(() => admin.users({ search: debounced, page, limit: 20 }), [debounced, page]);

  const toggleRole = async (u) => {
    const role = u.role === 'admin' ? 'student' : 'admin';
    if (!window.confirm(role === 'admin' ? `تدي ${u.name} صلاحية مدير؟` : `تشيل صلاحية المدير من ${u.name}؟`)) return;
    try {
      await admin.setRole(u.id, role);
      toast({ title: 'تم تحديث الصلاحية' });
      reload();
    } catch (err) {
      toast({ title: 'مقدرناش نحدّث الصلاحية', description: err.message, variant: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">المستخدمين</h1>
      <SearchBar id="admin-user-search" value={search} onChange={setSearch} placeholder="ابحث بالاسم أو البريد" label="بحث في المستخدمين" className="max-w-md" />
      {loading && !data ? (
        <Skeleton className="h-80 rounded-2xl" />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          <p className="text-sm text-muted">{data.meta.total} مستخدم</p>
          <DataTable
            rows={data.data}
            rowKey={(u) => u.id}
            empty="مفيش نتايج"
            columns={[
              {
                key: 'name',
                label: 'المستخدم',
                render: (u) => (
                  <span className="flex items-center gap-3">
                    <Avatar name={u.name} src={u.avatarUrl} size="sm" />
                    <span>
                      <span className="block text-ink">{u.name}</span>
                      <span className="block text-xs text-muted" dir="ltr">{u.email}</span>
                    </span>
                  </span>
                ),
              },
              { key: 'enrollments', label: 'الكورسات' },
              { key: 'emailVerified', label: 'البريد', render: (u) => (u.emailVerified ? <Badge tone="primary">مؤكد</Badge> : <Badge>غير مؤكد</Badge>) },
              { key: 'joinedAt', label: 'الانضمام', render: (u) => formatDate(u.joinedAt) },
              {
                key: 'role',
                label: 'الصلاحية',
                render: (u) => (
                  <span className="flex items-center gap-2">
                    {u.role === 'admin' ? <Badge tone="solid">مدير</Badge> : <Badge tone="outline">طالب</Badge>}
                    {u.id !== me.id && (
                      <button type="button" onClick={() => toggleRole(u)} className="text-xs text-primary hover:underline">
                        {u.role === 'admin' ? 'شيل الإدارة' : 'خليه مدير'}
                      </button>
                    )}
                  </span>
                ),
              },
            ]}
          />
          <Pagination page={page} totalPages={data.meta.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
