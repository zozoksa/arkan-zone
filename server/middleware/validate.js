import { HttpError } from '../utils/HttpError.js';

/** Validates req[source] with a zod schema and replaces it with the parsed value. */
export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source] ?? {});
  if (!result.success) {
    const details = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || 'form';
      if (!details[key]) details[key] = issue.message;
    }
    throw new HttpError(422, 'راجع البيانات المدخلة', details);
  }
  if (source === 'body') req.body = result.data;
  else req.validated = result.data;
  next();
};
