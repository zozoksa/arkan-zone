import { RefreshCw, WifiOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';

export default function ErrorState({ error, onRetry, title = 'مقدرناش نحمّل البيانات' }) {
  return (
    <EmptyState
      icon={WifiOff}
      title={title}
      description={error?.message ? `${error.message}. اتأكد من اتصالك وحاول تاني.` : 'حصلت مشكلة في الاتصال. اتأكد من اتصالك وحاول تاني.'}
      action={
        onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            <RefreshCw className="size-4" aria-hidden="true" />
            إعادة المحاولة
          </Button>
        )
      }
    />
  );
}
