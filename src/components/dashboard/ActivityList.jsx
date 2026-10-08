import { Link } from 'react-router-dom';
import { Award, BookPlus, CheckCircle2 } from 'lucide-react';
import { timeAgo } from '@/utils/format';

const config = {
  enroll: { icon: BookPlus, text: (a) => <>اشتركت في <b className="font-medium text-ink">{a.courseTitle}</b></> },
  lesson: { icon: CheckCircle2, text: (a) => <>خلّصت درس <b className="font-medium text-ink">{a.lessonTitle}</b></> },
  complete: { icon: Award, text: (a) => <>أكملت كورس <b className="font-medium text-ink">{a.courseTitle}</b></> },
};

export default function ActivityList({ activity }) {
  if (!activity.length) {
    return <p className="rounded-xl bg-raised p-4 text-sm text-muted">نشاطك هيظهر هنا أول ما تبدأ تتعلم.</p>;
  }
  return (
    <ol className="space-y-1">
      {activity.slice(0, 6).map((a) => {
        const { icon: Icon, text } = config[a.type] || config.lesson;
        return (
          <li key={a.id}>
            <Link to={`/courses/${a.courseId}`} className="flex gap-3 rounded-xl p-2.5 transition-colors hover:bg-sunken">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 text-sm">
                <span className="block text-ink-soft">{text(a)}</span>
                <span className="block text-xs text-muted">{timeAgo(a.at)}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
