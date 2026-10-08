import { platformStats } from '@/data/constants';

export default function StatsBand() {
  return (
    <section aria-label="أرقام المنصة" className="border-y border-line bg-surface">
      <dl className="container-page grid grid-cols-2 lg:grid-cols-4">
        {platformStats.map((stat, i) => (
          <div
            key={stat.id}
            className={`flex flex-col items-center gap-1 py-8 text-center sm:py-10 ${i % 2 === 0 ? 'border-e border-line' : ''} ${i < 2 ? 'border-b border-line lg:border-b-0' : ''} ${i === 1 ? 'lg:border-e' : ''}`}
          >
            <dd dir="ltr" className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              {stat.value}
            </dd>
            <dt className="text-muted">{stat.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
