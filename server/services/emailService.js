import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

/**
 * Sends transactional email. Without SMTP settings (development) emails are
 * printed to the console instead, so links (verify / reset) are still usable.
 */
const transporter = env.mail.host
  ? nodemailer.createTransport({
      host: env.mail.host,
      port: env.mail.port,
      secure: env.mail.secure,
      auth: env.mail.user ? { user: env.mail.user, pass: env.mail.pass } : undefined,
    })
  : null;

function layout({ title, body, cta }) {
  return `<!doctype html><html lang="ar" dir="rtl"><body style="margin:0;background:#f3f5f2;font-family:Tahoma,Arial,sans-serif;color:#15201b">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
  <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #dfe5e0;border-radius:16px;padding:32px;text-align:right">
  <tr><td style="font-size:20px;font-weight:bold;color:#0f6b57;padding-bottom:16px">Arkan Zone</td></tr>
  <tr><td style="font-size:20px;font-weight:bold;padding-bottom:12px">${title}</td></tr>
  <tr><td style="font-size:15px;line-height:1.9;color:#3b4943">${body}</td></tr>
  ${cta ? `<tr><td style="padding-top:24px"><a href="${cta.url}" style="display:inline-block;background:#0f6b57;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:bold">${cta.label}</a></td></tr>` : ''}
  <tr><td style="padding-top:28px;font-size:12px;color:#64716b">لو مش أنت اللي طلبت ده، تجاهل الرسالة.</td></tr>
  </table></td></tr></table></body></html>`;
}

export async function sendMail({ to, subject, title, body, cta, replyTo }) {
  const html = layout({ title: title || subject, body, cta });
  if (!transporter) {
    if (!env.isTest) {
      console.log(`\n[mail:dev] To: ${to}\n[mail:dev] Subject: ${subject}${cta ? `\n[mail:dev] Link: ${cta.url}` : ''}\n`);
    }
    return { delivered: false };
  }
  try {
    await transporter.sendMail({ from: env.mail.from, to, subject, html, replyTo });
    return { delivered: true };
  } catch (error) {
    // Email failures must never break the user's action (e.g. registration).
    console.error('[mail] send failed:', error.message);
    return { delivered: false };
  }
}

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const emails = {
  verify: (user, token) =>
    sendMail({
      to: user.email,
      subject: 'أكّد بريدك الإلكتروني | Arkan Zone',
      title: `أهلًا ${esc(user.name)}، أكّد بريدك`,
      body: 'اضغط على الزرار عشان تأكد بريدك الإلكتروني. الرابط صالح لمدة 48 ساعة.',
      cta: { label: 'تأكيد البريد', url: `${env.clientUrl}/verify-email?token=${token}` },
    }),
  reset: (user, token) =>
    sendMail({
      to: user.email,
      subject: 'استعادة كلمة المرور | Arkan Zone',
      title: 'استعادة كلمة المرور',
      body: 'وصلنا طلب لتغيير كلمة المرور. الرابط صالح لمدة ساعة واحدة.',
      cta: { label: 'تعيين كلمة مرور جديدة', url: `${env.clientUrl}/reset-password?token=${token}` },
    }),
  receipt: (user, order, course) =>
    sendMail({
      to: user.email,
      subject: `إيصال اشتراكك في ${course.title}`,
      title: 'تم الاشتراك بنجاح',
      body: `اشتركت في كورس <b>${esc(course.title)}</b>.<br>رقم الطلب: ${order.id}<br>المبلغ المدفوع: ${order.amount} ج.م${order.discount ? `<br>الخصم: ${order.discount} ج.م (${esc(order.coupon_code)})` : ''}`,
      cta: { label: 'ابدأ التعلّم', url: `${env.clientUrl}/learn/${course.id}` },
    }),
  certificate: (user, course, code) =>
    sendMail({
      to: user.email,
      subject: `مبروك! شهادة إتمام ${course.title}`,
      title: 'أكملت الكورس',
      body: `مبروك يا ${esc(user.name)}، أكملت كورس <b>${esc(course.title)}</b>. شهادتك جاهزة، ورقم التحقق: ${code}`,
      cta: { label: 'عرض الشهادة', url: `${env.clientUrl}/certificates/${code}` },
    }),
  contact: (msg) =>
    sendMail({
      to: env.mail.contactInbox,
      replyTo: msg.email,
      subject: `رسالة جديدة من ${msg.name}`,
      title: 'رسالة جديدة من نموذج التواصل',
      body: `<b>${esc(msg.name)}</b> (${esc(msg.email)})<br><br>${esc(msg.message).replace(/\n/g, '<br>')}`,
    }),
};
