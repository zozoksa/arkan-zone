import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/common/ScrollToTop';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Analytics from '@/components/common/Analytics';

function RouteFallback() {
  return (
    <div className="container-page py-24" role="status" aria-label="جاري التحميل">
      <div className="mx-auto h-1 w-40 overflow-hidden rounded-full bg-sunken">
        <div className="skeleton h-full w-full" />
      </div>
    </div>
  );
}

export default function MainLayout() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      <Analytics />
      <Navbar />
      <main id="main" className="flex-1">
        <ErrorBoundary key={pathname}>
          <Suspense fallback={<RouteFallback />}>
            <div key={pathname} className="animate-fade-in">
              <Outlet />
            </div>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
