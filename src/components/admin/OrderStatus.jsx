import Badge from '@/components/ui/Badge';

const map = {
  paid: ['primary', 'مدفوع'],
  pending: ['accent', 'معلّق'],
  failed: ['neutral', 'فشل'],
  refunded: ['outline', 'مسترد'],
};

export default function OrderStatus({ status }) {
  const [tone, label] = map[status] || ['neutral', status];
  return <Badge tone={tone}>{label}</Badge>;
}

export const providerLabel = { paymob: 'Paymob', mock: 'تجريبي', free: 'مجاني', coupon: 'كود 100%' };
