import { cn } from '@/utils/cn';

export default function SectionHeader({ title, description, action, as: Tag = 'h2', className, id }) {
  return (
    <div className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="max-w-2xl">
        <Tag id={id} className="text-2xl font-bold sm:text-[1.9rem]">
          {title}
        </Tag>
        {description && <p className="mt-2 text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
