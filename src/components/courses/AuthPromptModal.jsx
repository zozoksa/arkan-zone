import { useLocation } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function AuthPromptModal({ open, onClose, courseTitle }) {
  const location = useLocation();
  const state = { from: location.pathname, intent: 'enroll' };
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
          <LockKeyhole className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-xl font-bold">سجّل دخولك للاشتراك</h2>
        <p className="mt-2 text-muted">
          محتاج حساب عشان تشترك في «{courseTitle}» وتتابع تقدمك. هترجع للكورس ده تلقائيًا بعد الدخول.
        </p>
        <div className="mt-6 grid gap-3">
          <Button to="/login" state={state} onClick={onClose}>
            تسجيل الدخول
          </Button>
          <Button to="/register" state={state} variant="secondary" onClick={onClose}>
            إنشاء حساب جديد
          </Button>
        </div>
      </div>
    </Modal>
  );
}
