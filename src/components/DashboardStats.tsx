import { motion } from 'motion/react';
import { 
  Key, 
  CheckCircle2, 
  Clock, 
  FileWarning, 
  Activity,
  CalendarDays,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { LicenseKey, SystemLog } from '../types';

interface DashboardStatsProps {
  keys: LicenseKey[];
  logs: SystemLog[];
}

export default function DashboardStats({ keys, logs }: DashboardStatsProps) {
  // Statistics calculations
  const total = keys.length;
  const active = keys.filter(k => k.status === 'active').length;
  const unused = keys.filter(k => k.status === 'unused').length;
  const expired = keys.filter(k => k.status === 'expired').length;
  const revoked = keys.filter(k => k.status === 'revoked').length;

  const dailyCount = keys.filter(k => k.duration === 'daily').length;
  const weeklyCount = keys.filter(k => k.duration === 'weekly').length;
  const monthlyCount = keys.filter(k => k.duration === 'monthly').length;

  // Chart data
  const durationData = [
    { name: 'يومي (Daily)', value: dailyCount, color: '#38bdf8' },
    { name: 'أسبوعي (Weekly)', value: weeklyCount, color: '#818cf8' },
    { name: 'شهري (Monthly)', value: monthlyCount, color: '#f43f5e' },
  ].filter(item => item.value > 0);

  // Fallback data for empty charts
  const emptyChartData = [
    { name: 'لا توجد بيانات', value: 1, color: '#374151' }
  ];

  const statusData = [
    { name: 'نشط', count: active, fill: '#10b981' },
    { name: 'غير مستخدم', count: unused, fill: '#f59e0b' },
    { name: 'منتهي', count: expired, fill: '#6b7280' },
    { name: 'ملغي', count: revoked, fill: '#ef4444' }
  ];

  return (
    <div className="space-y-8" id="dashboard-stats-container">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Keys Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg"
          id="stat-card-total"
        >
          <div className="space-y-2">
            <span className="text-slate-400 text-sm font-medium block">إجمالي المفاتيح</span>
            <span className="text-3xl font-bold font-mono text-white block">{total}</span>
            <span className="text-xs text-slate-500 block">المفاتيح التي تم توليدها</span>
          </div>
          <div className="p-4 bg-slate-800/80 text-sky-400 rounded-xl">
            <Key className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Active Keys Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg"
          id="stat-card-active"
        >
          <div className="space-y-2">
            <span className="text-slate-400 text-sm font-medium block">مفاتيح نشطة</span>
            <span className="text-3xl font-bold font-mono text-emerald-400 flex items-center gap-2">
              {active}
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            </span>
            <span className="text-xs text-emerald-500/80 block">يديرها مستخدمون حالياً</span>
          </div>
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Unused Keys Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg"
          id="stat-card-unused"
        >
          <div className="space-y-2">
            <span className="text-slate-400 text-sm font-medium block">جاهزة للتفعيل</span>
            <span className="text-3xl font-bold font-mono text-amber-500 block">{unused}</span>
            <span className="text-xs text-amber-500/80 block">غير مستخدمة بعد</span>
          </div>
          <div className="p-4 bg-amber-500/10 text-amber-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Blocked/Expired Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg"
          id="stat-card-expired"
        >
          <div className="space-y-2">
            <span className="text-slate-400 text-sm font-medium block">ملغاة أو منتهية</span>
            <span className="text-3xl font-bold font-mono text-rose-500 block">{expired + revoked}</span>
            <span className="text-xs text-rose-500/80 block">{expired} منتهية / {revoked} ملغاة</span>
          </div>
          <div className="p-4 bg-rose-500/10 text-rose-500 rounded-xl">
            <FileWarning className="w-6 h-6" />
          </div>
        </motion.div>

      </div>

      {/* Visual Analytics Sector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Charts */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Chart 1: Subscription Breakdown Pie Chart */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg flex flex-col h-[360px]" id="duration-chart-holder">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-sky-400" />
                توزيع فترات الاشتراكات
              </h3>
              <p className="text-xs text-slate-500">مقارنة بين كمية الاشتراكات اليومية والأسبوعية والشهرية</p>
            </div>
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={durationData.length > 0 ? durationData : emptyChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(durationData.length > 0 ? durationData : emptyChartData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value) => [`${value} مفتاح`, 'الكمية']}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-slate-400 font-sans">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              {durationData.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 font-medium">
                  لا توجد مفاتيح مسجلة بعد
                </div>
              )}
            </div>
          </div>

          {/* Chart 2: Status Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg flex flex-col h-[360px]" id="status-chart-holder">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                حالة المفاتيح ونسب الحضور
              </h3>
              <p className="text-xs text-slate-500">عدد المفاتيح المصنفة حسب الاستخدام والتأهيل</p>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={11} 
                    allowDecimals={false} 
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={38}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Side: Operational Activity Feed */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg flex flex-col h-[360px]" id="logs-container">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
                سجل العمليات الأخير
              </h3>
              <p className="text-xs text-slate-500">مراقبة حية لتوليد وتفعيل المفاتيح برمجياً</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 font-sans custom-scrollbar">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                <Zap className="w-8 h-8 opacity-20" />
                <span className="text-xs">السجل فارغ. بانتظار نشاط النظام...</span>
              </div>
            ) : (
              logs.map((log) => {
                let badgeColor = 'bg-sky-500/10 text-sky-400 hover:bg-sky-500/20';
                let typeText = 'توليد';
                
                if (log.type === 'activate') {
                  badgeColor = 'bg-emerald-500/10 text-emerald-400';
                  typeText = 'تفعيل';
                } else if (log.type === 'revoke') {
                  badgeColor = 'bg-rose-500/15 text-rose-400';
                  typeText = 'إلغاء';
                } else if (log.type === 'validate_success') {
                  badgeColor = 'bg-indigo-500/10 text-indigo-400';
                  typeText = 'تحقق ناجح';
                } else if (log.type === 'validate_failed') {
                  badgeColor = 'bg-amber-500/10 text-amber-500';
                  typeText = 'فشل التحقق';
                }

                return (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={log.id}
                    className="flex flex-col p-3 rounded-xl bg-slate-800/40 border border-slate-800/80 gap-1 hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>
                        {typeText}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-xs text-slate-200 mt-0.5">
                      {log.action}
                    </div>
                    {log.clientName && (
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-500" />
                          {log.clientName}
                        </span>
                        {log.keySnippet && (
                          <span className="font-mono text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded text-[10px]">
                            {log.keySnippet}...
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
