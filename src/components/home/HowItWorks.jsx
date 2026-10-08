import { Compass, Hammer, Medal } from 'lucide-react';

const steps = [
  { icon: Compass, title: 'اختار مسارك', text: 'حدد المجال والمستوى، وشوف محتوى الكورس والمعاينة المجانية قبل ما تشترك.' },
  { icon: Hammer, title: 'اتعلم بالتطبيق', text: 'دروس قصيرة ومركزة بعدها تمرين أو اختبار، وتقدمك بيتحفظ أول بأول.' },
  { icon: Medal, title: 'اطلع بمشروع وشهادة', text: 'كل كورس بينتهي بمشروع حقيقي تضيفه لملف أعمالك، وشهادة إتمام.' },
];

export default function HowItWorks() {
  return (
    <section className="container-page py-16 lg:py-24" aria-labelledby="how-title">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.6fr] lg:gap-16">
        <div>
          <h2 id="how-title" className="text-2xl font-bold sm:text-[1.9rem]">
            من أول درس لحد أول مشروع
          </h2>
          <p className="mt-3 max-w-sm text-muted">طريقة واضحة ومجربة، من غير حشو ولا فيديوهات طويلة ملهاش لازمة.</p>
        </div>
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="bg-surface p-6">
              <div className="flex items-center justify-between">
                <step.icon className="size-6 text-primary" aria-hidden="true" />
                <span className="font-display text-sm font-medium text-muted">الخطوة {i + 1}</span>
              </div>
              <h3 className="mt-6 text-lg font-medium">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
