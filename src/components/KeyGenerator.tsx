import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  User, 
  Calendar, 
  Laptop, 
  Sparkles, 
  AlertCircle,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { SubscriptionDuration, KeyPermission } from '../types';

interface KeyGeneratorProps {
  onGenerate: (data: {
    clientName: string;
    duration: SubscriptionDuration;
    permissions: string[];
    maxDevices: number;
    notes: string;
    count: number;
  }) => void;
}

// Fixed available software permissions to license
const AVAILABLE_PERMISSIONS: KeyPermission[] = [
  { id: 'perm_full', name: 'الوصول الكامل (Full Access)', description: 'فتح كل الأدوات والميزات الحالية والمستقبلية بلا قيود' },
  { id: 'perm_premium', name: 'الأدوات المتقدمة (Premium Tools)', description: 'الوصول الحصري لأدوات معالجة البيانات والتصميم الفائقة' },
  { id: 'perm_cloud', name: 'الحفظ السحابي (Cloud Sync)', description: 'مزامنة الإعدادات وحفظ المشروعات والملفات مشفرة على السحابة' },
  { id: 'perm_api', name: 'مفاتيح المطورين (API Integration)', description: 'إمكانية استخدام نظام الربط والعمليات البرمجية الخارجية' },
  { id: 'perm_beta', name: 'النسخ التجريبية (Beta Releases)', description: 'أسبقية اختبار الترقيات والمزايا قيد التطوير والاختبار' },
];

export default function KeyGenerator({ onGenerate }: KeyGeneratorProps) {
  const [clientName, setClientName] = useState('');
  const [duration, setDuration] = useState<SubscriptionDuration>('monthly');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['perm_full', 'perm_premium']);
  const [maxDevices, setMaxDevices] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [bulkCount, setBulkCount] = useState<number>(1);
  const [successMsg, setSuccessMsg] = useState(false);

  const togglePermission = (id: string) => {
    setSelectedPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSelectAllPermissions = () => {
    if (selectedPermissions.length === AVAILABLE_PERMISSIONS.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(AVAILABLE_PERMISSIONS.map(p => p.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fallback client name if empty
    const finalClient = clientName.trim() || 'مشترك عام (General User)';
    
    onGenerate({
      clientName: finalClient,
      duration,
      permissions: selectedPermissions,
      maxDevices,
      notes: notes.trim(),
      count: bulkCount
    });

    // Reset some fields
    setClientName('');
    setNotes('');
    setBulkCount(1);
    
    // Flash success notification
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden" id="key-generator-component">
      
      {/* Decorative accent background glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            توليد مفاتيح اشتراكات جديدة
          </h2>
          <p className="text-xs text-slate-500 mt-1">تحديد فترات التفعيل، عدد الأجهزة المصرح لها، وصلاحيات التشغيل لكل مفتاح</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Row 1: Client Name & Bulk Count */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Client Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">اسم المشترك / المؤسسة</label>
            <div className="relative">
              <input
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="أدخل اسم العميل (مثال: أحمد محمد)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-xs text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
            <p className="text-[10px] text-slate-500">في حالة تركه فارغاً، سيتم التوليد للمشترك العام تلقائياً</p>
          </div>

          {/* Bulk Count */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex justify-between">
              <span>كمية المفاتيح لتوليدها دفعة واحدة (Bulk)</span>
              <span className="text-indigo-400 font-mono text-xs">{bulkCount} {bulkCount === 1 ? 'مفتاح واحد' : 'مفاتيح'}</span>
            </label>
            <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3">
              <input
                type="range"
                min="1"
                max="25"
                value={bulkCount}
                onChange={e => setBulkCount(parseInt(e.target.value))}
                className="flex-1 accent-indigo-500 h-1 cursor-pointer bg-slate-800 rounded-lg appearance-none"
              />
              <span className="text-xs font-mono font-bold text-indigo-400 w-8 text-center bg-indigo-500/15 py-1 px-2 rounded-md">
                {bulkCount}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">يساعد في توليد رموز ترخيص مسبقة الدفع للتوزيع الخارجي كبطاقات هدايا</p>
          </div>

        </div>

        {/* Row 2: Duration Period Selection */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-slate-300 block">اختر فترة صلاحية الاشتراك</label>
          <div className="grid grid-cols-3 gap-4" id="duration-selection-group">
            
            {/* Daily Card */}
            <button
              type="button"
              onClick={() => setDuration('daily')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-center relative ${
                duration === 'daily' 
                  ? 'border-sky-500 bg-sky-500/10 text-white shadow-md' 
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-5 h-5 mb-1.5 text-sky-400" />
              <span className="text-xs font-bold block">يومي (Daily)</span>
              <span className="text-[10px] text-slate-500 mt-1">تفعيل لمدة 24 ساعة</span>
              {duration === 'daily' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sky-400" />}
            </button>

            {/* Weekly Card */}
            <button
              type="button"
              onClick={() => setDuration('weekly')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-center relative ${
                duration === 'weekly' 
                  ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-md' 
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-5 h-5 mb-1.5 text-indigo-400" />
              <span className="text-xs font-bold block">أسبوعي (Weekly)</span>
              <span className="text-[10px] text-slate-500 mt-1">تفعيل لمدة 7 أيام متتالية</span>
              {duration === 'weekly' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-400" />}
            </button>

            {/* Monthly Card */}
            <button
              type="button"
              onClick={() => setDuration('monthly')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-center relative ${
                duration === 'monthly' 
                  ? 'border-rose-500 bg-rose-500/10 text-white shadow-md' 
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-5 h-5 mb-1.5 text-rose-400" />
              <span className="text-xs font-bold block">شهري (Monthly)</span>
              <span className="text-[10px] text-slate-500 mt-1">تفعيل ممتد لـ 30 يوماً</span>
              {duration === 'monthly' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-400" />}
            </button>

          </div>
        </div>

        {/* Row 3: Max Device Limit & Custom Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Max Allowed Devices */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">الحد الأقصى للأجهزة الفعالة (Device HWID Limit)</label>
            <div className="relative">
              <select
                value={maxDevices}
                onChange={e => setMaxDevices(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all cursor-pointer font-sans appearance-none"
              >
                <option value={1}>جهاز واحد فقط (Single PC/Mobile)</option>
                <option value={2}>جهازين (Dual Systems)</option>
                <option value={3}>3 أجهزة (Small Team)</option>
                <option value={5}>5 أجهزة (Office Use)</option>
                <option value={10}>10 أجهزة (Enterprise Tier)</option>
                <option value={999}>بلاريا - أجهزة غير محدودة (Unlimited)</option>
              </select>
              <Laptop className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
            <p className="text-[10px] text-slate-500">منع مشاركة نفس مفتاح الترخيص مع مستخدمين غير مصرح لهم خارجياً</p>
          </div>

          {/* Admin Internal Notes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">ملاحظات توثيقية إضافية (اختياري)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="مثال: فاتورة رقم #9902 - مبيعات تيليجرام"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
            />
            <p className="text-[10px] text-slate-500">تسهل عملية البحث والأرشفة لاحقاً وتحديد وسطاء البيع</p>
          </div>

        </div>

        {/* Row 4: Configured App Permissions & Features Toggles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
            <label className="text-xs font-semibold text-slate-300">أذونات وصلاحيات المنتج البرمجي</label>
            <button
              type="button"
              onClick={handleSelectAllPermissions}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              {selectedPermissions.length === AVAILABLE_PERMISSIONS.length ? 'إلغاء تحديد الكل' : 'تحديد جميع الأذونات'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="permissions-toggle-grid">
            {AVAILABLE_PERMISSIONS.map((perm) => {
              const isSelected = selectedPermissions.includes(perm.id);
              return (
                <button
                  type="button"
                  key={perm.id}
                  onClick={() => togglePermission(perm.id)}
                  className={`flex items-start p-3 rounded-xl border text-right transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-indigo-500/80 bg-indigo-500/5 text-indigo-200' 
                      : 'border-slate-800/80 bg-slate-950/60 text-slate-400 hover:border-slate-700/80 hover:bg-slate-950/90'
                  }`}
                >
                  <div className={`mt-0.5 rounded border flex-shrink-0 w-4 h-4 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-700'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="mr-3 space-y-1">
                    <span className="text-xs font-bold block">{perm.name}</span>
                    <span className="text-[10px] text-slate-500 block leading-relaxed">{perm.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trigger Button with alert notice */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs text-right sm:text-left">
            <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>سيتم توليد كود ترخيص مشفر فريد (UUID v4) غير قابل للتخمين</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-xs font-bold text-white shadow-lg cursor-pointer transition-all"
              id="submit-generate-btn"
            >
              <Plus className="w-4 h-4" />
              توليد المفتاح المعتمد
            </motion.button>
          </div>
        </div>

      </form>

      {/* Success Notification Float */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="absolute bottom-6 left-6 bg-slate-950 border border-emerald-500/50 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xl z-10"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>تم توليد وإدراج مفاتيح الترخيص بنجاح!</span>
        </motion.div>
      )}

    </div>
  );
}
