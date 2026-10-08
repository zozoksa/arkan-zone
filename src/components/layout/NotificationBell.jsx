import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Award, Bell, BookPlus, CreditCard, PartyPopper } from 'lucide-react';
import * as api from '@/services/api';
import { timeAgo } from '@/utils/format';
import { cn } from '@/utils/cn';

const icons = { certificate: Award, enroll: BookPlus, payment: CreditCard, welcome: PartyPopper };

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ unread: 0, items: [] });
  const ref = useRef(null);
  const { pathname } = useLocation();

  const load = useCallback(() => api.getNotifications().then(setData).catch(() => {}), []);

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [load, pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const readAll = async () => {
    setData((d) => ({ unread: 0, items: d.items.map((n) => ({ ...n, read: true })) }));
    await api.markAllNotificationsRead().catch(() => {});
  };

  const openItem = (n) => {
    setOpen(false);
    if (!n.read) {
      setData((d) => ({ unread: Math.max(0, d.unread - 1), items: d.items.map((x) => (x.id === n.id ? { ...x, read: true } : x)) }));
      api.markNotificationRead(n.id).catch(() => {});
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={data.unread ? `الإشعارات، ${data.unread} غير مقروءة` : 'الإشعارات'}
        className="relative grid size-10 place-items-center rounded-xl text-ink-soft transition-colors hover:bg-sunken hover:text-ink"
      >
        <Bell className="size-5" />
        {data.unread > 0 && (
          <span className="absolute end-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold leading-4 text-white">
            {data.unread > 9 ? '9+' : data.unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] animate-scale-in rounded-2xl border border-line bg-surface shadow-pop">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-medium">الإشعارات</p>
            {data.unread > 0 && (
              <button type="button" onClick={readAll} className="text-sm text-primary hover:underline">
                تعليم الكل كمقروء
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto p-2">
            {data.items.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">مفيش إشعارات لسه</li>}
            {data.items.map((n) => {
              const Icon = icons[n.type] || Bell;
              const content = (
                <>
                  <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg', n.read ? 'bg-sunken text-muted' : 'bg-primary-soft text-primary')}>
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-sm', n.read ? 'text-ink-soft' : 'font-medium text-ink')}>{n.title}</span>
                    {n.body && <span className="block truncate text-xs text-muted">{n.body}</span>}
                    <span className="block text-xs text-muted">{timeAgo(n.createdAt)}</span>
                  </span>
                  {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="غير مقروء" />}
                </>
              );
              return (
                <li key={n.id}>
                  {n.link ? (
                    <Link to={n.link} onClick={() => openItem(n)} className="flex gap-3 rounded-xl p-2.5 hover:bg-sunken">
                      {content}
                    </Link>
                  ) : (
                    <button type="button" onClick={() => openItem(n)} className="flex w-full gap-3 rounded-xl p-2.5 text-start hover:bg-sunken">
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
