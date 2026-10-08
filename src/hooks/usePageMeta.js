import { useEffect } from 'react';

const SITE = 'Arkan Zone';
const DEFAULT_DESCRIPTION =
  'Arkan Zone منصة تعليمية عربية بكورسات عملية في البرمجة والتصميم والذكاء الاصطناعي والتسويق.';

function setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    const [, key, name] = selector.match(/\[(\w+)="([^"]+)"\]/);
    el.setAttribute(key, name);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/** Sets document title + description (and OG equivalents) for the current page. */
export function usePageMeta(title, description = DEFAULT_DESCRIPTION) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE}` : `${SITE} | تعلم مهارات المستقبل`;
    document.title = fullTitle;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', description);
  }, [title, description]);
}
