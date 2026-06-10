import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error('الرجاء ضبط المتغيرات البيئية: VITE_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const admin = createClient(url, serviceRoleKey);

  const email = process.env.ADMIN_EMAIL || 'admin@local';
  const password = process.env.ADMIN_PASSWORD || 'ADREES1997adrees';

  try {
    const res = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin', username: 'admin' }
    });

    if (res.error) {
      console.error('فشل إنشاء المستخدم:', res.error);
      process.exit(1);
    }

    console.log('تم إنشاء المستخدم بنجاح: ', res.user?.id, ' — البريد:', email);
  } catch (err: any) {
    console.error('خطأ غير متوقع:', err.message || err);
    process.exit(1);
  }
}

main();
