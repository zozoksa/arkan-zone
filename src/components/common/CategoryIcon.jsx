import { BrainCircuit, BriefcaseBusiness, CodeXml, Languages, Megaphone, PenTool, ShieldCheck, Users, BookOpen } from 'lucide-react';

const map = {
  code: CodeXml,
  pen: PenTool,
  brain: BrainCircuit,
  megaphone: Megaphone,
  briefcase: BriefcaseBusiness,
  languages: Languages,
  shield: ShieldCheck,
  users: Users,
};

export default function CategoryIcon({ name, className }) {
  const Icon = map[name] || BookOpen;
  return <Icon className={className} aria-hidden="true" />;
}
