/** Join truthy class names. Tiny replacement for clsx. */
export function cn(...parts) {
  return parts.flat().filter(Boolean).join(' ');
}
