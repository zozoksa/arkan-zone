import { Component } from 'react';
import Button from '@/components/ui/Button';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('UI error:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold">الصفحة دي واجهت مشكلة</h1>
        <p className="mt-2 max-w-md text-muted">حصل خطأ غير متوقع أثناء عرض الصفحة. حدّث الصفحة أو ارجع للرئيسية.</p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => window.location.reload()}>تحديث الصفحة</Button>
          <Button variant="secondary" href="/">
            الرئيسية
          </Button>
        </div>
      </div>
    );
  }
}
