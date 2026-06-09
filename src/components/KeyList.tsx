import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Copy, 
  Trash2, 
  Ban, 
  CalendarPlus, 
  Laptop, 
  Check, 
  Shield, 
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { LicenseKey, SubscriptionDuration, KeyStatus } from '../types';

interface KeyListProps {
  keys: LicenseKey[];
  onActivate: (id: string) => void;
  onRevoke: (id: string) => void;
  onExtend: (id: string, duration: SubscriptionDuration) => void;
  onDelete: (id: string) => void;
}

export default function KeyList({ keys, onActivate, onRevoke, onExtend, onDelete }: KeyListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | KeyStatus>('all');
  const [durationFilter, setDurationFilter] = useState<'all' | SubscriptionDuration>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Handle clipboard copy
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Human friendly names map
  const getDurationLabel = (d: SubscriptionDuration) => {
    switch (d) {
      case 'daily': return 'يومي (24س)';
      case 'weekly': return 'أسبوعي (7أيام)';
      case 'monthly': return 'شهري (30يوم)';
    }
  };

  const getDurationColor = (d: SubscriptionDuration) => {
    switch (d) {
      case 'daily': return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'weekly': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'monthly': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    }
  };

  const getStatusBadge = (status: KeyStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            نشط (Active)
          </span>
        );
      case 'unused':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            غير مستعمل
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            منتهي (Expired)
          </span>
        );
      case 'revoked':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            ملغي (Revoked)
          </span>
        );
    }
  };

  // Filter keys listing
  const filteredKeys = keys.filter(item => {
    const matchesSearch = 
      item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesDuration = durationFilter === 'all' || item.duration === durationFilter;

    return matchesSearch && matchesStatus && matchesDuration;
  });

  // Pagination index calculation
  const totalItems = filteredKeys.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedKeys = filteredKeys.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden" id="key-list-management-component">
      
      {/* Search/Header Control Bar */}
      <div className="p-6 border-b border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-indigo-400" />
              مدير مفاتيح الاشتراكات والصلاحيات
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              عرض تفاصيل {filteredKeys.length} من أصل {keys.length} مفتاح، مع خيارات التحكم بسير التفعيل والتمديد وحظر الاستعمال.
            </p>
          </div>

          {/* Quick Stats Mini Bar */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-400">
            <span>إجمالي النشط: <span className="text-emerald-400 font-bold">{keys.filter(k => k.status === 'active').length}</span></span>
            <span className="text-slate-700">|</span>
            <span>بانتظار الاستخدام: <span className="text-amber-500 font-bold">{keys.filter(k => k.status === 'unused').length}</span></span>
          </div>
        </div>

        {/* Filter Selection Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
          
          {/* Search Field */}
          <div className="md:col-span-5 relative">
            <input
              type="text"
              placeholder="ابحث بواسطة: اسم العميل، مفتاح الترخيص، أو الملاحظة..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-300 outline-none focus:border-indigo-500 transition-all font-sans"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          </div>

          {/* Status Filter Dropdown */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none focus:border-indigo-500 transition-all cursor-pointer font-sans"
            >
              <option value="all">كل حالات التفعيل (All Statuses)</option>
              <option value="active">نشطة مسبقاً (Active)</option>
              <option value="unused">غير مستخدمة حتى الآن (Unused)</option>
              <option value="expired">منتهية الصلاحية تلقائياً (Expired)</option>
              <option value="revoked">ملغاة وموقوفة إدارياً (Revoked)</option>
            </select>
          </div>

          {/* Duration Filter Dropdown */}
          <div className="md:col-span-4">
            <select
              value={durationFilter}
              onChange={e => { setDurationFilter(e.target.value as any); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none focus:border-indigo-500 transition-all cursor-pointer font-sans"
            >
              <option value="all">كل فترات الاشتراك (All Durations)</option>
              <option value="daily">يومي فقط (Daily)</option>
              <option value="weekly">أسبوعي فقط (Weekly)</option>
              <option value="monthly">شهري فقط (Monthly)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Licenses Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-xs font-semibold">
              <th className="p-4 pr-6">اسم العميل وتفصيل الترخيص</th>
              <th className="p-4">كود الاشتراك الفريد (Subscription License Key)</th>
              <th className="p-4">تفاصيل الفترة</th>
              <th className="p-4">أجهزة الاستخدام</th>
              <th className="p-4 text-center">تاريخ التفعيل / الصلاحية</th>
              <th className="p-4 text-center">الأعمال والتحكم الإداري</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {paginatedKeys.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Search className="w-10 h-10 text-slate-700 stroke-[1.5]" />
                    <p className="text-sm">لم يتم العثور على أي مفاتيح اشتراك مطابقة لمعايير البحث الحالية.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedKeys.map((item) => (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={item.id}
                  className="hover:bg-slate-800/35 transition-colors text-xs align-middle"
                >
                  
                  {/* Client name / permissions */}
                  <td className="p-4 pr-6 space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {item.clientName}
                      {item.notes && (
                        <span className="text-[10px] bg-slate-800 text-slate-400 font-sans font-normal px-2 py-0.5 rounded-md" title={item.notes}>
                          {item.notes.substring(0, 18)}{item.notes.length > 18 ? '...' : ''}
                        </span>
                      )}
                    </div>
                    {/* Tiny badges reflecting permission permissions length */}
                    <div className="flex flex-wrap gap-1">
                      {item.permissions.length === 0 ? (
                        <span className="text-[9px] text-slate-500">بدون صلاحيات إضافية</span>
                      ) : (
                        <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-md font-medium border border-indigo-500/10">
                          {item.permissions.length} صلاحيات برمجية
                        </span>
                      )}
                      {item.permissions.includes('perm_full') && (
                        <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                          <Shield className="w-2.5 h-2.5" /> Full
                        </span>
                      )}
                    </div>
                  </td>

                  {/* License Key Code with Copy Clipboard */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs text-slate-200 bg-slate-950 border border-slate-800/80 px-2.5 py-1.5 rounded-lg select-all">
                        {item.key}
                      </code>
                      <button
                        onClick={() => handleCopy(item.id, item.key)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0 ${
                          copiedId === item.id 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                        }`}
                        title="نسخ مفتاح الاشتراك"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>

                  {/* Duration details */}
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getDurationColor(item.duration)}`}>
                      {getDurationLabel(item.duration)}
                    </span>
                  </td>

                  {/* Devices Counter */}
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                      <Laptop className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.devicesUsed}</span>
                      <span className="text-slate-600">/</span>
                      <span className="text-slate-400">
                        {item.maxDevices === 999 ? '∞' : item.maxDevices}
                      </span>
                    </div>
                  </td>

                  {/* Status, custom creation & expiry values */}
                  <td className="p-4 text-center space-y-1">
                    <div>{getStatusBadge(item.status)}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {item.expiresAt ? (
                        <span className="text-slate-400">ينتهي: {new Date(item.expiresAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      ) : (
                        <span>غير مفعل بعد</span>
                      )}
                    </div>
                  </td>

                  {/* Management and control actions */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      
                      {/* Manual activation trigger if unused */}
                      {item.status === 'unused' && (
                        <button
                          onClick={() => onActivate(item.id)}
                          className="px-2 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 transition-all flex items-center gap-1 cursor-pointer"
                          title="تفعيل الترخيص يدوياً كعميل أول"
                        >
                          <Check className="w-3" />
                          تفعيل
                        </button>
                      )}

                      {/* Extend subscription trigger */}
                      {item.status !== 'revoked' && (
                        <button
                          onClick={() => onExtend(item.id, item.duration)}
                          className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors cursor-pointer"
                          title="تمديد فترة الاشتراك بنسبة 100%"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Block/Revoke Trigger */}
                      {item.status === 'active' && (
                        <button
                          onClick={() => onRevoke(item.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/10 hover:bg-rose-500/20 hover:text-rose-300 transition-colors cursor-pointer"
                          title="إيقاف وسحب الترخيص فوراً"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Permanent delete trigger */}
                      <button
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف مفتاح هذا الاشتراك تماماً من السجلات؟ لا يمكن التراجع عن هذا الإجراء.')) {
                            onDelete(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
                        title="حذف المفتاح نهائياً"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  </td>

                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination control footer bar */}
      {totalPages > 1 && (
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => handlePageChange('prev')}
            disabled={currentPage === 1}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              currentPage === 1 
                ? 'text-slate-600 bg-slate-900/30 cursor-not-allowed border border-transparent' 
                : 'text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
            السابق
          </button>
          
          <span className="text-xs text-slate-400 font-mono">
            صفحة <span className="text-white font-bold">{currentPage}</span> من <span className="text-white font-bold">{totalPages}</span>
          </span>

          <button
            onClick={() => handlePageChange('next')}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              currentPage === totalPages 
                ? 'text-slate-600 bg-slate-900/30 cursor-not-allowed border border-transparent' 
                : 'text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            التالي
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
