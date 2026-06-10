# 🔑 Subscription Key Manager & Licenser | لوحة إدارة مفاتيح اشتراكات وصلاحيات المستخدمين

لوحة تحكم احترافية ومثالية مصممة خصيصاً لمطوري البرمجيات ومقدمي الخدمات السحابية وموزعي الأكواد لتوليد وإدارة مفاتيح اشتراكات المستخدمين وتفعيلها زمنيًا ومراقبة الأجهزة المصرح لها بالولوج.

An elegant, highly-scalable **Subscription Key Manager and Licencer Dashboard** built to generate, control, monitor, and extend user subscriptions with duration types (*Daily, Weekly, Monthly*), comprehensive software permission management, and device limits (HWID tracking), complete with a live interactive **API / SDK verification console simulator**.

---

## 🌟 الميزات الأساسية | Key Features

* **توليد المفاتيح المتطور (Dynamic Key Generator):**
  * توليد مفاتيح ترخيص فريدة مشفرة غير قابلة للتخمين (UUID v4).
  * إمكانية التوليد الفردي أو المجمع دفعة واحدة (Bulk Generation) لغاية 25 مفتاحاً بكبسة زر واحدة.
  * تعيين فترات اشتراك دقيقة ومحددة: **يومي (24 ساعة)**، **أسبوعي (7 أيام)**، **شهري (30 يوماً)**.
  * تعيين قيود على عدد الأجهزة المسموح بتشغيل المفتاح عليها في نفس الوقت (Device HWID Limits).
  * ربط ميزات أو صلاحيات معينة لكل مفتاح (مثل: الوصول الكامل، الأدوات المتقدمة، الحفظ السحابي، الـ API، والنسخ التجريبية).

* **لوحة تحكم وتحليلات ذكية (Analytics Dashboard):**
  * بطاقات إحصائية حية ومؤشرات أداء (KPIs) لمراقبة المفاتيح النشطة والمخزنة والملغاة.
  * رسوم بيانية تفاعلية مدعومة بـ `recharts` لعرض نسب الاشتراكات وحالات التفعيل.
  * سجل عمليات فوري (Operational Audit Trail Live Logs) لمراقبة تفعيل وتداول وتأكيد التراخيص أولاً بأول.

* **إدارة كاملة لقاعدة البيانات (Comprehensive DB Manager):**
  * تصفية وفلترة متقدمة للبحث عن المفاتيح بواسطة اسم العميل، الترخيص، أو الملاحظة.
  * إجراءات تحكم فورية: تفعيل المفاتيح، تمديد وتجديد الاشتراكات بصيغة تراكمية، حظر وسحب التراخيص (Revoke) نهائياً، وشطب السجلات.
  * حفظ محلي آمن ومستمر عن طريق `localStorage` لضمان عدم فقدان تراخيصك أو عملائك عند تحديث المتصفح.

* **محاكي برمجية فحص الأكواد (Live API & SDK Tester Console):**
  * شاشة تحاكي اتصال تطبيقك أو لعبتك أو موقعك الإلكتروني بخادم الترخيص للتحقق من المفتاح.
  * كونسول برمجية تفاعلية تستعرض استجابات الـ JSON المختلفة بدقة (200 OK، 404 Not Found، 403 Revoked، 401 Expired، 429 Devices Limit).
  * نماذج أكواد متكاملة وجاهزة للنسخ والاستخدام لعدة لغات برمجية: **cURL**، **Node.js (Axios)**، **Python (Requests)**.

---

## 🛠️ التقنيات المستخدمة | Tech Stack

* **Front-end:** [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
* **Styles:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Builder:** [Vite](https://vite.dev/)
* **Animations:** [Motion (Framer Motion)](https://motion.dev/)
* **Charts:** [Recharts](https://recharts.org/)
* **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 تشغيل المشروع محلياً | Local Installation

إذا قمت بتحميل المشروع كملف ZIP وتريد تشغيله على جهازك الشخصي، اتبع الخطوات التالية:

### 1. تثبيت الحزم والمكونات:
قم بفتح منفذ الأوامر بمجلد المشروع واكتب:
```bash
npm install
```

### 1.1 متغيرات البيئة المطلوبة لربط Supabase
أضف ملف `.env` في جذر المشروع أو اضبط متغيرات البيئة في نظامك مع القيم التالية (استبدل القيم الحقيقية الخاصة بك):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_EMAIL=admin@local
ADMIN_PASSWORD=ADREES1997adrees
```

ملاحظة: لا تضع `SUPABASE_SERVICE_ROLE_KEY` في متغيرات تعتبر عامة أو في الواجهة (client). هذا المفتاح يجب أن يبقى سرياً ويُستخدم فقط في سكربتات الخادم أو محلياً أثناء الإعداد.

### 1.2 إنشاء مستخدم المشرف (Admin)
لتسجيل مستخدم المشرف في Supabase باستخدام مفتاح الخدمة (service role) شغّل الأمر:

```bash
npm run create-admin
```

هذا السكربت يستخدم القيم من `.env` لإنشاء المستخدم `admin` (أو ما مُحدد في `ADMIN_EMAIL`) بكلمة المرور `ADMIN_PASSWORD`.


### 2. تشغيل سيرفر المطورين:
```bash
npm run dev
```
سيتم تشغيل واجهة الموقع مباشرة على الرابط المحلي: `http://localhost:3000`

### 3. بناء نسخة الإنتاج النهائية:
```bash
npm run build
```

---

## 📤 كيفية الرفع على GitHub عبر AI Studio | Exporting to GitHub

بما أنك قمت بتطوير هذا الموقع داخل بيئة **Google AI Studio**، يمكنك رفعه مباشرة على حسابك في GitHub باتباع الخطوات التالية:

1. انظر للزاوية العلوية أو قائمة الإعدادات (Settings / Export Menu) داخل واجهة **Google AI Studio**.
2. اختر **Export to GitHub** (تصدير إلى جيت هب).
3. قم بالموافقة على ربط حسابك في GitHub وإعطاء الصلاحيات المطلوبة.
4. اختر اسماً للمستودع الجديد (Repository Name) ثم اضغط **Export** وسيتم رفع الكود كاملاً بشكل فوري ومنظم!

مبارك لك المشروع الاحترافي الجاهز للنشر والتداول! 🚀
