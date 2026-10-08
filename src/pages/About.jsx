import { useState } from 'react';
import { Mail, MapPin, MessageSquare, Target, Users, Wrench } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { sendContact } from '@/services/api';
import { usePageMeta } from '@/hooks/usePageMeta';
import { platformStats } from '@/data/constants';

const values = [
  { icon: Wrench, title: 'التطبيق قبل النظري', text: 'كل مفهوم بيتشرح جوه مشروع، عشان تطلع من الكورس بحاجة تقدر تعرضها.' },
  { icon: Target, title: 'محتوى على قد السوق', text: 'بنراجع الكورسات مع شركات توظيف عشان المهارات تفضل مطلوبة فعلًا.' },
  { icon: Users, title: 'مدربين شغالين في المجال', text: 'كل مدرب بيشتغل في اللي بيدرّسه، مش بس بيشرحه.' },
];

export default function About() {
  usePageMeta('من نحن', 'Arkan Zone منصة تعليمية عربية من مصر بتقدم كورسات عملية بمشاريع حقيقية.');
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const [errors, setErrors] = useState({});
  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.name.trim().length < 2) next.name = 'اكتب اسمك';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'البريد الإلكتروني غير صحيح';
    if (form.message.trim().length < 10) next.message = 'الرسالة لازم تكون 10 حروف على الأقل';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSending(true);
    try {
      await sendContact(form);
      setForm({ name: '', email: '', message: '' });
      toast({ title: 'تم إرسال رسالتك', description: 'هنرد عليك خلال يومين عمل.' });
    } catch (err) {
      setErrors(err.details || {});
      toast({ title: 'مقدرناش نبعت الرسالة', description: err.message, variant: 'error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="container-page grid gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <h1 className="text-3xl font-bold leading-tight sm:text-5xl">بنبني الأركان اللي هتقف عليها مسيرتك المهنية</h1>
          </div>
          <div className="space-y-4 text-lg leading-8 text-ink-soft">
            <p>
              Arkan Zone بدأت من سؤال بسيط: ليه المتعلم العربي لازم يختار بين محتوى مجاني مش منظم، وكورسات أجنبية بعيدة عن سوقه ولغته؟
            </p>
            <p>بنقدم كورسات عربية قصيرة ومركزة، كل واحد فيها بينتهي بمشروع حقيقي، ومدربين شغالين فعلًا في المجال.</p>
          </div>
        </div>
      </section>

      <section className="container-page py-14 lg:py-20" aria-label="قيمنا">
        <div className="grid gap-5 md:grid-cols-3">
          {values.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-line bg-surface p-6">
              <Icon className="size-6 text-primary" aria-hidden="true" />
              <h2 className="mt-5 text-lg font-medium">{title}</h2>
              <p className="mt-2 text-muted">{text}</p>
            </div>
          ))}
        </div>
        <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-line pt-10 sm:grid-cols-4">
          {platformStats.map((s) => (
            <div key={s.id}>
              <dd className="font-display text-3xl font-bold">
                <bdi dir="ltr">{s.value}</bdi>
              </dd>
              <dt className="text-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section id="contact" className="scroll-mt-24 border-t border-line bg-surface">
        <div className="container-page grid gap-10 py-14 lg:grid-cols-[1fr_1.3fr] lg:py-20">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">تواصل معنا</h2>
            <p className="mt-3 text-muted">عندك سؤال عن كورس، أو عايز تدرّب فريقك، أو حابب تبقى مدرب؟ ابعتلنا.</p>
            <ul className="mt-8 space-y-4 text-ink-soft">
              <li className="flex items-center gap-3">
                <Mail className="size-5 text-primary" aria-hidden="true" />
                <a href="mailto:hello@arkanzone.com" dir="ltr" className="hover:text-primary">
                  hello@arkanzone.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="size-5 text-primary" aria-hidden="true" />
                القاهرة، مصر
              </li>
              <li className="flex items-center gap-3">
                <MessageSquare className="size-5 text-primary" aria-hidden="true" />
                الرد خلال يومين عمل
              </li>
            </ul>
          </div>
          <form onSubmit={submit} noValidate className="space-y-5 rounded-2xl border border-line bg-canvas p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="الاسم" value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="البريد الإلكتروني" type="email" dir="ltr" value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <Input as="textarea" label="رسالتك" value={form.message} error={errors.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <Button type="submit" loading={sending}>
              إرسال الرسالة
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}
