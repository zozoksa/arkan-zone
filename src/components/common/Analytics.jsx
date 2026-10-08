import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_ID = import.meta.env.VITE_GA_ID;
const CLARITY_ID = import.meta.env.VITE_CLARITY_ID;

function inject(src, inline) {
  const s = document.createElement('script');
  if (src) {
    s.async = true;
    s.src = src;
  } else {
    s.text = inline;
  }
  document.head.appendChild(s);
}

/** Loads Google Analytics 4 / Microsoft Clarity only when their IDs are configured. */
export default function Analytics() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (GA_ID && !window.gtag) {
      inject(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', GA_ID, { send_page_view: false });
    }
    if (CLARITY_ID && !window.clarity) {
      inject(
        null,
        `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`,
      );
    }
  }, []);

  useEffect(() => {
    if (GA_ID && window.gtag) window.gtag('event', 'page_view', { page_path: pathname + search, page_title: document.title });
  }, [pathname, search]);

  return null;
}
