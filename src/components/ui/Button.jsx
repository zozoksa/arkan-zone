import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const variants = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover shadow-[0_1px_0_rgb(255_255_255/0.15)_inset]',
  secondary: 'bg-surface text-ink border border-line hover:border-line-strong hover:bg-raised',
  soft: 'bg-primary-soft text-primary hover:bg-primary/15',
  ghost: 'text-ink-soft hover:text-ink hover:bg-sunken',
  danger: 'bg-danger-soft text-danger hover:bg-danger/15',
  inverse: 'bg-white text-[#0f2a23] hover:bg-white/90',
  'ghost-inverse': 'text-white hover:bg-white/10',
};

const sizes = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-5 text-[0.95rem] gap-2 rounded-xl',
  lg: 'h-13 px-7 text-base gap-2.5 rounded-xl',
  icon: 'h-10 w-10 rounded-xl',
};

/**
 * Button that renders a <Link> when `to` is set, an <a> with `href`,
 * and a native <button> otherwise.
 */
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', to, href, loading = false, className, children, disabled, type = 'button', ...props },
  ref,
) {
  const classes = cn(
    'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium transition-[background-color,border-color,color,transform,box-shadow] duration-200',
    'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55',
    variants[variant],
    sizes[size],
    className,
  );
  const content = (
    <>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }
  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
});

export default Button;
