import { Link } from 'react-router-dom';
import Logo from '@/components/common/Logo';
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from '@/components/common/SocialIcons';
import { footerLinks } from '@/data/navigation';

const socials = [
  { label: 'Facebook', href: 'https://facebook.com', Icon: FacebookIcon },
  { label: 'Instagram', href: 'https://instagram.com', Icon: InstagramIcon },
  { label: 'LinkedIn', href: 'https://linkedin.com', Icon: LinkedinIcon },
  { label: 'YouTube', href: 'https://youtube.com', Icon: YoutubeIcon },
];

function LinkColumn({ title, links }) {
  return (
    <div>
      <h2 className="font-sans text-sm font-semibold text-ink">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="text-muted transition-colors hover:text-primary">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-muted">منصة تعليمية تساعدك على تعلم مهارات المستقبل.</p>
        </div>
        <LinkColumn title="روابط" links={footerLinks.links} />
        <LinkColumn title="الدعم" links={footerLinks.support} />
        <div>
          <h2 className="font-sans text-sm font-semibold text-ink">تابعنا</h2>
          <ul className="mt-4 flex gap-2">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-xl border border-line text-ink-soft transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="size-[18px]" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Arkan Zone. كل الحقوق محفوظة.</p>
          <p>صُنع في مصر للمتعلمين العرب</p>
        </div>
      </div>
    </footer>
  );
}
