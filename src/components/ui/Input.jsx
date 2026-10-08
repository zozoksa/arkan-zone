import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';

const Input = forwardRef(function Input(
  { label, hint, error, icon: Icon, type = 'text', className, inputClassName, as = 'input', ...props },
  ref,
) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const Field = as;

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink-soft">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted" aria-hidden="true" />
        )}
        <Field
          ref={ref}
          id={id}
          type={isPassword && reveal ? 'text' : type}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(
            'field',
            Icon && 'ps-10',
            isPassword && 'pe-11',
            as === 'textarea' && 'min-h-28 resize-y py-3',
            error && 'border-danger focus:border-danger focus:ring-danger/15',
            inputClassName,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="absolute end-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-sunken hover:text-ink"
            aria-label={reveal ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          >
            {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
