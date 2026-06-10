import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// استخدام المتغيرات البيئية من Vercel
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    // تفعيل CORS للسماح بالطلبات الخارجية
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // عرض رسالة Method Not Allowed عند الدخول من المتصفح (GET)
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const { user_key, serial } = req.body;

    if (!user_key || !serial) {
        return res.json({ status: false, reason: "الرجاء إرسال المفتاح والرقم التسلسلي" });
    }

    try {
        // 1. البحث عن المفتاح في جدول license_keys
        const { data: keyData, error } = await supabase
            .from('license_keys')
            .select('*')
            .eq('key', user_key)
            .single();

        if (error || !keyData) {
            return res.json({ status: false, reason: "المفتاح غير موجود" });
        }

        // 2. التحقق من حالة المفتاح (إذا كان مسحوباً/ملغى)
        if (keyData.status === 'revoked') {
            return res.json({ status: false, reason: "هذا المفتاح ملغى من قبل الإدارة" });
        }

        // 3. التحقق من تاريخ الانتهاء
        const now = new Date();
        if (keyData.expires_at && new Date(keyData.expires_at) < now) {
            return res.json({ status: false, reason: "انتهى اشتراكك" });
        }

        // 4. ربط الجهاز (HWID) وتحديث سجل العمليات
        if (keyData.status === 'unused' || !keyData.hwid) {
            const expiry = new Date();
            if (keyData.duration === 'daily') expiry.setHours(expiry.getHours() + 24);
            else if (keyData.duration === 'weekly') expiry.setDate(expiry.getDate() + 7);
            else if (keyData.duration === 'monthly') expiry.setDate(expiry.getDate() + 30);

            const { error: updateError } = await supabase.from('license_keys').update({
                status: 'active',
                hwid: serial,
                activated_at: now.toISOString(),
                expires_at: expiry.toISOString(),
                devices_used: 1
            }).eq('key', user_key);

            if (updateError) throw updateError;

            // إضافة سجل في system_logs
            await supabase.from('system_logs').insert([{
                type: 'activate',
                action: `تفعيل ناجح من تطبيق خارجي`,
                client_name: keyData.client_name,
                key_snippet: user_key.substring(0, 8),
                timestamp: now.toISOString()
            }]);
        } else if (keyData.hwid !== serial) {
            // إضافة سجل محاولة دخول فاشلة
            await supabase.from('system_logs').insert([{
                type: 'validate_failed',
                action: `محاولة دخول من جهاز غير مصرح به`,
                client_name: keyData.client_name,
                key_snippet: user_key.substring(0, 8),
                timestamp: now.toISOString()
            }]);
            return res.json({ status: false, reason: "المفتاح مرتبط بجهاز آخر" });
        }

        // 5. إنشاء التوكن للأمان (MD5)
        const salt = "Vm8Lk7Uj2JmsjCPVPVjrLa7zgfx3uz9E";
        const authString = `PUBG-${user_key}-${serial}-${salt}`;
        const token = crypto.createHash('md5').update(authString).digest('hex');

        // تحديث سجل الدخول الناجح
        await supabase.from('system_logs').insert([{
            type: 'validate_success',
            action: `تسجيل دخول ناجح`,
            client_name: keyData.client_name,
            key_snippet: user_key.substring(0, 8),
            timestamp: now.toISOString()
        }]);

        return res.json({
            status: true,
            data: {
                token,
                rng: Math.floor(Date.now() / 1000),
                expires_at: keyData.expires_at
            }
        });

    } catch (err) {
        console.error("API Error:", err);
        return res.status(500).json({ status: false, reason: "خطأ داخلي في الخادم" });
    }
}
