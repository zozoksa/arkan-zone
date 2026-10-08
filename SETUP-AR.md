# دليل تشغيل ونشر Arkan Zone خطوة بخطوة

## أولًا: التشغيل على جهازك

**المطلوب:** Node.js نسخة 22 أو أحدث. يُفضّل يكون مسار المشروع بحروف إنجليزي بس، زي `C:\projects\arkan-zone`.

1. افتح Terminal في فولدر المشروع واكتب:
   ```bash
   npm run setup
   ```
   الأمر ده بيسطّب مكتبات الواجهة والسيرفر مع بعض.

2. انسخ ملفات الإعدادات:
   ```bash
   copy .env.example .env
   copy server\.env.example server\.env
   ```
   على Mac أو Linux استخدم `cp` بدل `copy`.

3. شغّل السيرفر في Terminal أول:
   ```bash
   npm run server
   ```
   أول مرة هيعمل قاعدة البيانات لوحده ويضيف الكورسات والحسابات.

4. شغّل الموقع في Terminal تاني:
   ```bash
   npm run dev
   ```
   وافتح http://localhost:5173

**الحسابات الجاهزة:**
- **أدمن:** `admin@arkanzone.com` / `Admin@12345`
- **طالب تجريبي:** `demo@arkanzone.com` / `123456`

**في وضع التطوير:**
- **الإيميلات:** مش بتتبعت فعلًا. بتظهر في Terminal السيرفر، ومعاها رابط تأكيد البريد أو استعادة كلمة المرور، تنسخه وتفتحه.
- **الدفع:** بتظهرلك صفحة دفع تجريبية، تختار منها نجاح أو فشل. وكود الخصم `WELCOME20` بيدّي 20%.
- **الفيديو:** بيظهر مكانه شكل مؤقت لحد ما تربط Bunny.

**لو حبيت تمسح كل البيانات وتبدأ من الأول:** اقفل السيرفر، وامسح فولدر `server/storage` (مش `server/data`، ده فيه الكورسات)، وشغّله تاني.

---

## ثانيًا: الحاجات اللي محتاج تجهزها قبل الإطلاق

### 1. الدفع: Paymob
1. اعمل حساب على https://accept.paymob.com وكمّل بيانات النشاط التجاري.
2. من لوحة التحكم هات:
   - Secret Key
   - Public Key
   - HMAC Secret
   - Integration IDs (واحد لكل طريقة دفع: كارت، محفظة، أمان، وهكذا)
3. حطهم في ملف `server/.env`:
   ```
   PAYMOB_SECRET_KEY=...
   PAYMOB_PUBLIC_KEY=...
   PAYMOB_HMAC_SECRET=...
   PAYMOB_INTEGRATION_IDS=123456,789012
   ```
4. في إعدادات Paymob، خلي **Transaction processed callback** يشاور على:
   `https://دومينك/api/payments/paymob/webhook`
5. **جرّب الأول بمفاتيح الـ Test Mode** قبل المفاتيح الحقيقية.

### 2. الإيميل: SMTP
أي خدمة إيميل تنفع، زي Gmail Workspace أو Zoho أو Brevo أو Amazon SES. حط بياناتها في `server/.env`:
```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
MAIL_FROM=Arkan Zone <no-reply@دومينك>
CONTACT_INBOX=الإيميل اللي توصلك عليه رسائل تواصل معنا
```

### 3. الفيديو: Bunny Stream
1. اعمل حساب على https://bunny.net، وبعدها Stream ثم Add Video Library.
2. من إعدادات المكتبة، فعّل **Token Authentication**. ده بيمنع إن رابط الفيديو يتنسخ ويتشارك.
3. حط القيمتين دول في `server/.env`:
   ```
   BUNNY_LIBRARY_ID=...
   BUNNY_TOKEN_KEY=...
   ```
4. ارفع الفيديو على Bunny، وخد الـ Video ID بتاعه، واربطه بالدرس:
   ```bash
   npm --prefix server run video:assign -- 2-l5 الـvideo-id
   ```
   رقم الدرس (زي `2-l5`) تقدر تشوفه من `http://localhost:5000/api/courses/2`.

### 4. Google Analytics أو Clarity (اختياري)
حط `VITE_GA_ID` أو `VITE_CLARITY_ID` في ملف `.env` بتاع الواجهة.

---

## ثالثًا: النشر على سيرفر بـ Docker

**المطلوب:** سيرفر Linux عليه Docker، ودومين متوجّه على IP السيرفر.

1. ارفع المشروع على السيرفر، عن طريق git أو scp.

2. جهّز ملف الإعدادات:
   ```bash
   cp deploy/.env.production.example .env.production
   nano .env.production
   ```
   املأ كل القيم. أهمهم:
   - `PUBLIC_URL=https://دومينك`
   - `POSTGRES_PASSWORD`: كلمة سر قوية
   - `JWT_SECRET`: ولّده بالأمر ده:
     ```bash
     node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
     ```
   - `ADMIN_EMAIL` و`ADMIN_PASSWORD`
   - بيانات Paymob وSMTP وBunny

3. شغّل:
   ```bash
   docker compose --env-file .env.production up -d --build
   ```
   ده هيشغّل 3 حاجات:
   - **db:** قاعدة بيانات PostgreSQL.
   - **api:** السيرفر، وبيعمل الجداول ويضيف الكورسات أول مرة.
   - **web:** nginx، وبيعرض الموقع على بورت 80.

4. **HTTPS:** أسهل طريقة إنك تحط الدومين على Cloudflare وتفعّل الـ Proxy. أو تستخدم certbot أو Caddy على السيرفر.

5. ادخل بحساب الأدمن من `/login`، و**غيّر كلمة المرور فورًا** من الملف الشخصي.

**أوامر مفيدة:**
```bash
docker compose ps                         # حالة الخدمات
docker compose logs -f api                # لوج السيرفر
docker compose --env-file .env.production up -d --build   # بعد أي تحديث
docker compose exec api node scripts/make-admin.js email@x.com   # تخلي حد أدمن
```

**النسخ الاحتياطي:** خد نسخة من قاعدة البيانات بشكل دوري:
```bash
docker compose exec db pg_dump -U arkan arkan > backup-$(date +%F).sql
```

---

## رابعًا: قبل الإطلاق، اتأكد من الحاجات دي

- [ ] `JWT_SECRET` قوي ومختلف عن أي مثال.
- [ ] كلمة مرور الأدمن اتغيرت.
- [ ] جربت عملية دفع كاملة بمفاتيح Paymob الـ Test، ووصل الإيصال على الإيميل.
- [ ] الـ Callback URL في Paymob مظبوط.
- [ ] الموقع شغال على HTTPS.
- [ ] جربت استعادة كلمة المرور، والإيميل وصل.
- [ ] راجعت صفحات الخصوصية والشروط والاسترداد، ويُفضّل محامي يراجعها.
- [ ] عدّلت الأرقام في `src/data/constants.js` (+50 كورس، +10K طالب...) بالأرقام الحقيقية.
- [ ] عملت جدول للنسخ الاحتياطي.
