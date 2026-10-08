import { CheckCircle2, FileText, HelpCircle, Lock, PlayCircle, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import Accordion from '@/components/ui/Accordion';
import { lessonTypeLabel } from '@/utils/courseMeta';
import { formatLessons, formatMinutes } from '@/utils/format';

const typeIcons = { video: PlayCircle, article: FileText, quiz: HelpCircle, project: Wrench };

function LessonRow({ lesson, courseId, unlocked, completed }) {
  const Icon = typeIcons[lesson.type] || PlayCircle;
  const available = unlocked || lesson.preview;
  const content = (
    <>
      <Icon className="size-4 shrink-0 text-muted" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate text-ink-soft">{lesson.title}</span>
      {lesson.preview && !unlocked && <span className="text-xs font-medium text-primary">معاينة مجانية</span>}
      <span className="hidden text-xs text-muted sm:inline">{lessonTypeLabel[lesson.type]}</span>
      <span className="w-14 text-end text-xs tabular-nums text-muted">{formatMinutes(lesson.minutes)}</span>
      {completed ? (
        <CheckCircle2 className="size-4 shrink-0 text-primary" aria-label="مكتمل" />
      ) : available ? (
        <span className="size-4 shrink-0" />
      ) : (
        <Lock className="size-4 shrink-0 text-muted" aria-label="مقفول" />
      )}
    </>
  );

  return (
    <li>
      {unlocked ? (
        <Link to={`/learn/${courseId}?lesson=${lesson.id}`} className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-sunken">
          {content}
        </Link>
      ) : (
        <div className="flex items-center gap-3 px-5 py-3 text-sm">{content}</div>
      )}
    </li>
  );
}

export default function Curriculum({ course, enrollment }) {
  const unlocked = Boolean(enrollment);
  const done = new Set(enrollment?.completedLessons || []);
  const items = course.curriculum.map((section, i) => ({
    id: section.id,
    title: (
      <span>
        <span className="text-muted">القسم {i + 1}: </span>
        {section.title}
      </span>
    ),
    meta: `${formatLessons(section.lessons.length)}، ${formatMinutes(section.lessons.reduce((s, l) => s + l.minutes, 0))}`,
    content: (
      <ul className="divide-y divide-line/70">
        {section.lessons.map((lesson) => (
          <LessonRow key={lesson.id} lesson={lesson} courseId={course.id} unlocked={unlocked} completed={done.has(lesson.id)} />
        ))}
      </ul>
    ),
  }));

  return <Accordion items={items} defaultOpen={[course.curriculum[0]?.id]} />;
}
