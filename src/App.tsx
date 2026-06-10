import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  PlusCircle, 
  Database, 
  Terminal, 
  Clock,
  Code2,
  Trash2
} from 'lucide-react';
import { LicenseKey, SystemLog, SubscriptionDuration } from './types';
import DashboardStats from './components/DashboardStats';
import KeyGenerator from './components/KeyGenerator';
import KeyList from './components/KeyList';
import ApiSimulator from './components/ApiSimulator';
import Login from './components/Login';
import supabase from './lib/supabase';

// Helper to map DB snake_case to JS camelCase for LicenseKey
const mapKeyToCamel = (item: any): LicenseKey => ({
  id: item.id,
  key: item.key,
  clientName: item.client_name,
  duration: item.duration,
  status: item.status,
  permissions: item.permissions || [],
  createdAt: item.created_at,
  activatedAt: item.activated_at,
  expiresAt: item.expires_at,
  maxDevices: item.max_devices,
  devicesUsed: item.devices_used,
  notes: item.notes
});

// Helper to map JS camelCase to DB snake_case for LicenseKey
const mapKeyToSnake = (item: Partial<LicenseKey>, userId?: string) => ({
  key: item.key,
  client_name: item.clientName,
  duration: item.duration,
  status: item.status,
  permissions: item.permissions,
  created_at: item.createdAt,
  activated_at: item.activatedAt,
  expires_at: item.expiresAt,
  max_devices: item.maxDevices,
  devices_used: item.devicesUsed,
  notes: item.notes,
  created_by: userId
});

// Helper to map DB snake_case to JS camelCase for SystemLog
const mapLogToCamel = (item: any): SystemLog => ({
  id: item.id,
  timestamp: item.timestamp,
  action: item.action,
  clientName: item.client_name,
  keySnippet: item.key_snippet,
  type: item.type
});

// Standard UUID generator
// Custom Key generator based on user requirements: [ClientInitials]-[Days]-[Random]
function generateCustomKey(clientName: string, duration: SubscriptionDuration) {
  const cleanName = clientName.trim().toUpperCase().replace(/\s+/g, '').substring(0, 3);
  const namePart = cleanName.padEnd(3, 'X');

  let daysPart = '0';
  if (duration === 'daily') daysPart = '1';
  else if (duration === 'weekly') daysPart = '7';
  else if (duration === 'monthly') daysPart = '30';

  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();

  return `${namePart}-${daysPart}-${randomPart}`;
}

export default function App() {
  // 1. All Hooks at the top level
  const [session, setSession] = useState<any>(null);
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'generate' | 'keys' | 'tester'>('stats');
  const [loading, setLoading] = useState(true);

  // Auth Listener
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) setSession(data.session);
      } catch (e) {
        console.error("Auth error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Data Fetching
  const fetchData = async () => {
    if (!session) return;

    setLoading(true);
    try {
      const [keysRes, logsRes] = await Promise.all([
        supabase.from('license_keys').select('*').order('created_at', { ascending: false }),
        supabase.from('system_logs').select('*').order('timestamp', { ascending: false }).limit(50)
      ]);

      if (keysRes.data) setKeys(keysRes.data.map(mapKeyToCamel));
      if (logsRes.data) setLogs(logsRes.data.map(mapLogToCamel));
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setKeys([]);
    setLogs([]);
  };

  // Log Helper
  const addSystemLog = async (
    action: string, 
    clientName: string, 
    keySnippet: string, 
    type: SystemLog['type']
  ) => {
    const { data, error } = await supabase.from('system_logs').insert({
      action,
      client_name: clientName,
      key_snippet: keySnippet,
      type
    }).select().single();

    if (data) {
      setLogs(prev => [mapLogToCamel(data), ...prev].slice(0, 50));
    }
    if (error) console.error("Log error:", error);
  };

  // Action 1: Create Keys
  const handleGenerateKeys = async (data: {
    clientName: string;
    duration: SubscriptionDuration;
    permissions: string[];
    maxDevices: number;
    notes: string;
    count: number;
  }) => {
    const batch = [];
    for (let i = 0; i < data.count; i++) {
      const isBulk = data.count > 1;
      const clientLabel = isBulk ? `${data.clientName} (مجموعة #${i + 1})` : data.clientName;
      
      batch.push(mapKeyToSnake({
        key: generateCustomKey(data.clientName, data.duration),
        clientName: clientLabel,
        duration: data.duration,
        status: 'unused',
        permissions: data.permissions,
        maxDevices: data.maxDevices,
        devicesUsed: 0,
        notes: data.notes
      }, session?.user?.id));
    }

    const { data: inserted, error } = await supabase.from('license_keys').insert(batch).select();

    if (inserted) {
      const newKeys = inserted.map(mapKeyToCamel);
      setKeys(prev => [...newKeys, ...prev]);
      
      const logMsg = data.count === 1
        ? `تم توليد مفتاح ترخيص جديد: ${newKeys[0].key.substring(0, 8)}`
        : `تم توليد ${data.count} مفتاح ترخيص بشكل مجمع`;

      addSystemLog(logMsg, data.clientName, newKeys[0].key.substring(0, 8), 'create');
    }
    if (error) alert("خطأ في إنشاء المفاتيح: " + error.message);
  };

  // Action 2: Activate Key
  const handleActivateKey = async (id: string) => {
    const target = keys.find(k => k.id === id);
    if (!target || target.status !== 'unused') return;

    const now = new Date();
    const expiry = new Date();
    if (target.duration === 'daily') expiry.setHours(expiry.getHours() + 24);
    else if (target.duration === 'weekly') expiry.setDate(expiry.getDate() + 7);
    else if (target.duration === 'monthly') expiry.setDate(expiry.getDate() + 30);

    const { data, error } = await supabase.from('license_keys').update({
      status: 'active',
      activated_at: now.toISOString(),
      expires_at: expiry.toISOString(),
      devices_used: 1
    }).eq('id', id).select().single();

    if (data) {
      const updated = mapKeyToCamel(data);
      setKeys(prev => prev.map(k => k.id === id ? updated : k));
      addSystemLog(`تم تفعيل الترخيص بنجاح`, updated.clientName, updated.key.substring(0, 8), 'activate');
    }
    if (error) alert("خطأ في التفعيل: " + error.message);
  };

  // Action 3: Revoke
  const handleRevokeKey = async (id: string) => {
    const { data, error } = await supabase.from('license_keys').update({
      status: 'revoked'
    }).eq('id', id).select().single();

    if (data) {
      const updated = mapKeyToCamel(data);
      setKeys(prev => prev.map(k => k.id === id ? updated : k));
      addSystemLog(`تم سحب الترخيص وإيقافه`, updated.clientName, updated.key.substring(0, 8), 'revoke');
    }
  };

  // Action 4: Extend
  const handleExtendKey = async (id: string, duration: SubscriptionDuration) => {
    const target = keys.find(k => k.id === id);
    if (!target) return;

    const now = new Date();
    const startPoint = (target.expiresAt && new Date(target.expiresAt) > now)
      ? new Date(target.expiresAt)
      : now;

    const newExpiry = new Date(startPoint);
    if (duration === 'daily') newExpiry.setHours(newExpiry.getHours() + 24);
    else if (duration === 'weekly') newExpiry.setDate(newExpiry.getDate() + 7);
    else if (duration === 'monthly') newExpiry.setDate(newExpiry.getDate() + 30);

    const { data, error } = await supabase.from('license_keys').update({
      status: 'active',
      expires_at: newExpiry.toISOString()
    }).eq('id', id).select().single();

    if (data) {
      const updated = mapKeyToCamel(data);
      setKeys(prev => prev.map(k => k.id === id ? updated : k));
      addSystemLog(`تم تمديد فترة الاشتراك`, updated.clientName, updated.key.substring(0, 8), 'activate');
    }
  };

  // Action 5: Delete
  const handleDeleteKey = async (id: string) => {
    const target = keys.find(k => k.id === id);
    const { error } = await supabase.from('license_keys').delete().eq('id', id);

    if (!error) {
      setKeys(prev => prev.filter(k => k.id !== id));
      if (target) addSystemLog(`تم حذف المفتاح نهائياً`, target.clientName, target.key.substring(0, 8), 'revoke');
    }
  };

  // Action 6: API Simulation
  const handleSimulateApiCall = async (keyId: string, _deviceUid: string) => {
    const target = keys.find(k => k.id === keyId);
    if (!target) return { success: false, error: 'المفتاح غير موجود' };

    if (target.status === 'unused') {
      await handleActivateKey(keyId);
      return { success: true };
    }

    if (target.status === 'active') {
      if (target.devicesUsed >= target.maxDevices) {
        addSystemLog(`فشل التحقق: تجاوز حد الأجهزة`, target.clientName, target.key.substring(0, 8), 'validate_failed');
        return { success: false, error: 'تجاوزت الحد الأقصى للأجهزة' };
      }

      const { data } = await supabase.from('license_keys').update({
        devices_used: target.devicesUsed + 1
      }).eq('id', keyId).select().single();

      if (data) {
        setKeys(prev => prev.map(k => k.id === keyId ? mapKeyToCamel(data) : k));
        addSystemLog(`تحقق ناجح وزيادة عدد الأجهزة`, target.clientName, target.key.substring(0, 8), 'validate_success');
        return { success: true };
      }
    }

    return { success: false, error: 'الترخيص غير صالح أو منتهي' };
  };

  const handleResetDatabase = async () => {
    if (confirm('هل أنت متأكد من مسح جميع البيانات؟')) {
      await supabase.from('license_keys').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('system_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      fetchData();
    }
  };

  // Render Logic
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <Login onLogin={fetchData} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600/60 selection:text-white" dir="rtl">
      
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <ShieldCheck className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5 leading-none">
                لوحة مفاتيح الاشتراكات المعتمدة
              </h1>
              <span className="text-[10px] sm:text-xs text-slate-400 block mt-1 font-mono">
                Subscription & SDK Activation Terminal
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'stats' 
                  ? 'bg-slate-800 text-white border border-slate-700/80 shadow' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">نظرة عامة</span>
            </button>

            <button
              onClick={() => setActiveTab('generate')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'generate' 
                  ? 'bg-slate-800 text-white border border-slate-700/80 shadow' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>توليد مفاتيح</span>
            </button>

            <button
              onClick={() => setActiveTab('keys')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'keys' 
                  ? 'bg-slate-800 text-white border border-slate-700/80 shadow' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Database className="w-4 h-4 text-sky-400" />
              <span>قاعدة البيانات</span>
              <span className="bg-slate-950 font-mono text-[10px] text-sky-400 font-bold px-1.5 py-0.5 rounded-full border border-sky-400/10">
                {keys.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tester')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tester' 
                  ? 'bg-slate-800 text-white border border-slate-700/80 shadow' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-4 h-4 text-rose-400" />
              <span>فحص الكود (API)</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-slate-400 hover:text-rose-400 hover:bg-slate-800/50"
            >
              خروج
            </button>
          </nav>
        </div>
      </header>

      <section className="bg-slate-900 border-b border-slate-850 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">نظام ترخيص متصل بـ Supabase</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">منصة إدارة الصلاحيات ومفاتيح التراخيص</h2>
            </div>
            
            <button
              onClick={handleResetDatabase}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-750 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-slate-500" />
              مسح كافة البيانات
            </button>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'stats' && (
            <motion.div key="tab-stats" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
              <DashboardStats keys={keys} logs={logs} />
            </motion.div>
          )}

          {activeTab === 'generate' && (
            <motion.div key="tab-generate" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="max-w-4xl mx-auto">
              <KeyGenerator onGenerate={handleGenerateKeys} />
            </motion.div>
          )}

          {activeTab === 'keys' && (
            <motion.div key="tab-keys" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
              <KeyList
                keys={keys}
                onActivate={handleActivateKey}
                onRevoke={handleRevokeKey}
                onExtend={handleExtendKey}
                onDelete={handleDeleteKey}
              />
            </motion.div>
          )}

          {activeTab === 'tester' && (
            <motion.div key="tab-tester" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
              <ApiSimulator keys={keys} onSimulateUsage={handleSimulateApiCall} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-8 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono">
          <span>قاعدة البيانات متصلة عبر Supabase</span>
          <span>© {new Date().getFullYear()} لوحة إدارة التراخيص</span>
        </div>
      </footer>
    </div>
  );
}
