const numberFmt = new Intl.NumberFormat('en-US');
const compactFmt = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const dateFmt = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' });

export const formatNumber = (n) => numberFmt.format(n);
export const formatCompact = (n) => compactFmt.format(n);

export function formatPrice(price) {
  if (!price) return 'مجاني';
  return `${numberFmt.format(price)} ج.م`;
}

export function formatHours(hours) {
  if (hours <= 0) return 'أقل من ساعة';
  if (hours === 1) return 'ساعة واحدة';
  if (hours === 2) return 'ساعتين';
  if (hours <= 10) return `${hours} ساعات`;
  return `${hours} ساعة`;
}

export function formatMinutes(minutes) {
  if (minutes < 60) return `${minutes} د`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} س ${m} د` : `${h} س`;
}

export function formatLessons(n) {
  if (n === 1) return 'درس واحد';
  if (n === 2) return 'درسين';
  if (n <= 10) return `${n} دروس`;
  return `${n} درس`;
}

export const formatDate = (iso) => dateFmt.format(new Date(iso));

export function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'دلوقتي';
  if (diff < 3600) return `من ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `من ${Math.floor(diff / 3600)} ساعة`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return 'امبارح';
  if (days < 30) return `من ${days} يوم`;
  return formatDate(iso);
}

export function discountPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}
