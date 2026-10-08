export const mainNav = [
  { to: '/', label: 'الرئيسية', end: true },
  { to: '/courses', label: 'الكورسات' },
  { to: '/categories', label: 'التصنيفات' },
  { to: '/about', label: 'من نحن' },
];

export const accountNav = [
  { to: '/dashboard', label: 'لوحة التحكم', icon: 'dashboard' },
  { to: '/my-courses', label: 'كورساتي', icon: 'courses' },
  { to: '/favorites', label: 'المفضلة', icon: 'favorites' },
  { to: '/profile', label: 'الملف الشخصي', icon: 'profile' },
];

export const footerLinks = {
  links: [
    { to: '/', label: 'الرئيسية' },
    { to: '/courses', label: 'الكورسات' },
    { to: '/about', label: 'من نحن' },
    { to: '/about#contact', label: 'تواصل معنا' },
  ],
  support: [
    { to: '/faq', label: 'الأسئلة الشائعة' },
    { to: '/privacy', label: 'سياسة الخصوصية' },
    { to: '/terms', label: 'الشروط والأحكام' },
    { to: '/refund-policy', label: 'سياسة الاسترداد' },
  ],
};

export const sortOptions = [
  { value: 'popular', label: 'الأكثر شعبية' },
  { value: 'rating', label: 'الأعلى تقييمًا' },
  { value: 'newest', label: 'الأحدث' },
  { value: 'price-asc', label: 'السعر من الأقل للأعلى' },
  { value: 'price-desc', label: 'السعر من الأعلى للأقل' },
];

export const priceOptions = [
  { value: 'all', label: 'كل الأسعار' },
  { value: 'free', label: 'مجاني' },
  { value: 'paid', label: 'مدفوع' },
];

export const ratingOptions = [
  { value: 0, label: 'أي تقييم' },
  { value: 4.5, label: '4.5 فأكثر' },
  { value: 4, label: '4.0 فأكثر' },
  { value: 3.5, label: '3.5 فأكثر' },
];
