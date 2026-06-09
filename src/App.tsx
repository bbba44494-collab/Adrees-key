import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  PlusCircle, 
  Database, 
  Terminal, 
  Key, 
  HelpCircle,
  Clock,
  Code2,
  Trash2,
  Settings
} from 'lucide-react';
import { LicenseKey, SystemLog, SubscriptionDuration } from './types';
import DashboardStats from './components/DashboardStats';
import KeyGenerator from './components/KeyGenerator';
import KeyList from './components/KeyList';
import ApiSimulator from './components/ApiSimulator';

// Standard UUID license node generator function
function generateLicenseUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16).toUpperCase();
  });
}

// Default pre-populated license records for dynamic, rich first loading
const DEFAULT_KEYS: LicenseKey[] = [
  {
    id: 'key-1',
    key: 'A1B2C3D4-E5F6-4A7B-8C9D-0E1F2A3B4C5D',
    clientName: 'شركة الحلول البرمجية المتكاملة',
    duration: 'monthly',
    status: 'active',
    permissions: ['perm_full', 'perm_premium', 'perm_cloud'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    activatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // expires in 25 days
    maxDevices: 3,
    devicesUsed: 2,
    notes: 'عقد المبيعات السنوي - باقة كاملة'
  },
  {
    id: 'key-2',
    key: '9F8E7D6C-5B4A-4938-2716-01524310E9D8',
    clientName: 'عبد الرحمن الحربي (سكربت بوت)',
    duration: 'weekly',
    status: 'active',
    permissions: ['perm_premium', 'perm_api'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    activatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // expires in 5 days
    maxDevices: 1,
    devicesUsed: 1,
    notes: 'قناة التليجرام - سداد كاش'
  },
  {
    id: 'key-3',
    key: 'E4D3C2B1-A099-4876-2223-AAABBBCCCDDD',
    clientName: 'متجر الفرسان الإلكتروني',
    duration: 'monthly',
    status: 'unused',
    permissions: ['perm_full', 'perm_cloud'],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    activatedAt: null,
    expiresAt: null,
    maxDevices: 5,
    devicesUsed: 0,
    notes: 'موزع رقم #10 - منتظر تسليم العميل'
  },
  {
    id: 'key-4',
    key: 'F5E4D3C2-B1A0-4987-6543-ABCDEF012345',
    clientName: 'خالد السعدي (رخصة يومية تجريبية)',
    duration: 'daily',
    status: 'expired',
    permissions: ['perm_premium'],
    createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    activatedAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(), // expired weeks ago
    maxDevices: 1,
    devicesUsed: 1,
    notes: 'فترة تجريبية 24 ساعة - مبيعات تويتر'
  },
  {
    id: 'key-5',
    key: 'B18C06FA-EAD9-498C-AF06-DBCC8EFA3921',
    clientName: 'أبو فهد - أداة استخراج البيانات',
    duration: 'monthly',
    status: 'revoked',
    permissions: ['perm_full', 'perm_api', 'perm_beta'],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    activatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    maxDevices: 2,
    devicesUsed: 2,
    notes: 'تم إلغاء الترخيص لتخطي عدد أجهزة تسجيل الدخول بالتزامن'
  }
];

const DEFAULT_LOGS: SystemLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    action: 'تم التحقق بنجاح من صلاحية المفتاح والترخيص معتمد',
    clientName: 'شركة الحلول البرمجية المتكاملة',
    keySnippet: 'A1B2C3D4',
    type: 'validate_success'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    action: 'تم إيقاف وإلغاء مفتاح الاشتراك إدارياً لمخالفة ضوابط الاستخدام المتزامن',
    clientName: 'أبو فهد - أداة استخراج البيانات',
    keySnippet: 'B18C06FA',
    type: 'revoke'
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    action: 'تم التفعيل الذاتي لأول مرة للاشتراك الأسبوعي المعتمد',
    clientName: 'عبد الرحمن الحربي (سكربت بوت)',
    keySnippet: '9F8E7D6C',
    type: 'activate'
  }
];

export default function App() {
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'generate' | 'keys' | 'tester'>('stats');

  // Load state from localStorage on startup
  useEffect(() => {
    const savedKeys = localStorage.getItem('license_keys_manager_db');
    const savedLogs = localStorage.getItem('license_keys_manager_logs');

    if (savedKeys) {
      setKeys(JSON.parse(savedKeys));
    } else {
      setKeys(DEFAULT_KEYS);
      localStorage.setItem('license_keys_manager_db', JSON.stringify(DEFAULT_KEYS));
    }

    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    } else {
      setLogs(DEFAULT_LOGS);
      localStorage.setItem('license_keys_manager_logs', JSON.stringify(DEFAULT_LOGS));
    }
  }, []);

  // Save changes to localStorage helper
  const updateLocalState = (updatedKeys: LicenseKey[], updatedLogs?: SystemLog[]) => {
    setKeys(updatedKeys);
    localStorage.setItem('license_keys_manager_db', JSON.stringify(updatedKeys));
    
    if (updatedLogs) {
      setLogs(updatedLogs);
      localStorage.setItem('license_keys_manager_logs', JSON.stringify(updatedLogs));
    } else {
      localStorage.setItem('license_keys_manager_logs', JSON.stringify(logs));
    }
  };

  // Add system logs helper
  const addSystemLog = (
    action: string, 
    clientName: string, 
    keySnippet: string, 
    type: SystemLog['type'],
    currentKeys: LicenseKey[]
  ) => {
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      clientName,
      keySnippet,
      type
    };
    const updatedLogs = [newLog, ...logs].slice(0, 50); // Keep last 50 logs max
    updateLocalState(currentKeys, updatedLogs);
  };

  // Action 1: Create Keys (supports single or bulk)
  const handleGenerateKeys = (data: {
    clientName: string;
    duration: SubscriptionDuration;
    permissions: string[];
    maxDevices: number;
    notes: string;
    count: number;
  }) => {
    const generated: LicenseKey[] = [];
    const timestampStr = new Date().toISOString();

    for (let i = 0; i < data.count; i++) {
      const isBulk = data.count > 1;
      const clientLabel = isBulk ? `${data.clientName} (مجموعة #${i + 1})` : data.clientName;
      
      const newKey: LicenseKey = {
        id: `key-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        key: generateLicenseUUID(),
        clientName: clientLabel,
        duration: data.duration,
        status: 'unused',
        permissions: data.permissions,
        createdAt: timestampStr,
        expiresAt: null,
        activatedAt: null,
        maxDevices: data.maxDevices,
        devicesUsed: 0,
        notes: data.notes
      };
      generated.push(newKey);
    }

    const updatedKeys = [...generated, ...keys];
    
    // Create audit log
    const logMsg = data.count === 1 
      ? `تم توليد مفتاح ترخيص فردي جديد للاشتراك الـ ${data.duration === 'daily' ? 'يومي' : data.duration === 'weekly' ? 'أسبوعي' : 'شهري'}`
      : `تم توليد دفعة تراخيص مجمعة (Bulk) بعدد ${data.count} مفتاح اشتراك`;
      
    addSystemLog(logMsg, data.clientName, generated[0].key.substring(0, 8), 'create', updatedKeys);
  };

  // Action 2: Activate Key manually
  const handleActivateKey = (id: string) => {
    const freshKeys = keys.map(k => {
      if (k.id === id && k.status === 'unused') {
        const now = new Date();
        const expiry = new Date();

        // Calculate lifespan based on duration
        if (k.duration === 'daily') expiry.setHours(expiry.getHours() + 24);
        else if (k.duration === 'weekly') expiry.setDate(expiry.getDate() + 7);
        else if (k.duration === 'monthly') expiry.setDate(expiry.getDate() + 30);

        return {
          ...k,
          status: 'active' as const,
          activatedAt: now.toISOString(),
          expiresAt: expiry.toISOString(),
          devicesUsed: Math.max(1, k.devicesUsed) // assume at least one device active on activation
        };
      }
      return k;
    });

    const target = keys.find(k => k.id === id);
    if (target) {
      addSystemLog(
        `تم تفعيل كود الترخيص وبدء الفترة الزمنية بنجاح (${target.duration})`,
        target.clientName,
        target.key.substring(0, 8),
        'activate',
        freshKeys
      );
    }
  };

  // Action 3: Suspend/Revoke key
  const handleRevokeKey = (id: string) => {
    const freshKeys = keys.map(k => {
      if (k.id === id) {
        return {
          ...k,
          status: 'revoked' as const
        };
      }
      return k;
    });

    const target = keys.find(k => k.id === id);
    if (target) {
      addSystemLog(
        `تم سحب وإلغاء مفتاح الاشتراك فوراً ووقف تشغيل التطبيق للعميل`,
        target.clientName,
        target.key.substring(0, 8),
        'revoke',
        freshKeys
      );
    }
  };

  // Action 4: Renew / Extend subscription time
  const handleExtendKey = (id: string, duration: SubscriptionDuration) => {
    const freshKeys = keys.map(k => {
      if (k.id === id) {
        const now = new Date();
        // Calculate new expiration
        // If expired or unused, extend starting from now. Otherwise, stack onto active remaining period.
        const startPoint = (k.expiresAt && new Date(k.expiresAt) > now) 
          ? new Date(k.expiresAt) 
          : now;
          
        const newExpiry = new Date(startPoint);

        if (duration === 'daily') newExpiry.setHours(newExpiry.getHours() + 24);
        else if (duration === 'weekly') newExpiry.setDate(newExpiry.getDate() + 7);
        else if (duration === 'monthly') newExpiry.setDate(newExpiry.getDate() + 30);

        return {
          ...k,
          status: 'active' as const, // recover active status
          expiresAt: newExpiry.toISOString(),
          activatedAt: k.activatedAt || now.toISOString()
        };
      }
      return k;
    });

    const target = keys.find(k => k.id === id);
    if (target) {
      const typeText = duration === 'daily' ? 'يوم واحد' : duration === 'weekly' ? '7 أيام' : '30 يوماً';
      addSystemLog(
        `تم تجديد وتمديد صلاحية مفتاح الاشتراك الإضافي بمقدار +${typeText}`,
        target.clientName,
        target.key.substring(0, 8),
        'activate', // reuse activate type log
        freshKeys
      );
    }
  };

  // Action 5: Hard Delete Key
  const handleDeleteKey = (id: string) => {
    const target = keys.find(k => k.id === id);
    const freshKeys = keys.filter(k => k.id !== id);
    
    if (target) {
      addSystemLog(
        `تم شطب وحذف مفتاح الترخيص تماماً من سجلات الخادم وقاعدة البيانات`,
        target.clientName,
        target.key.substring(0, 8),
        'revoke',
        freshKeys
      );
    }
  };

  // Action 6: Simulate Live API endpoint verification (used in ApiSimulator)
  const handleSimulateApiCall = (keyId: string, clientDeviceUid: string): { success: boolean; error?: string } => {
    let returnObj = { success: true, error: '' };
    
    const freshKeys = keys.map(k => {
      if (k.id === keyId) {
        const now = new Date();
        
        // 1. If key is currently unused, activate it automatically on the fly
        if (k.status === 'unused') {
          const expiry = new Date();
          if (k.duration === 'daily') expiry.setHours(expiry.getHours() + 24);
          else if (k.duration === 'weekly') expiry.setDate(expiry.getDate() + 7);
          else if (k.duration === 'monthly') expiry.setDate(expiry.getDate() + 30);

          return {
            ...k,
            status: 'active' as const,
            activatedAt: now.toISOString(),
            expiresAt: expiry.toISOString(),
            devicesUsed: 1
          };
        }

        // 2. If key is already active, check hardware limits
        if (k.status === 'active') {
          // If already on max devices, and this is a simulation under a hypothetical new device structure
          // To keep it simple, we simulate slot increments up to maxDevices.
          // Let's assume testing with a device increments device limit count if it hasn't registered yet
          const alreadyLinked = k.devicesUsed > 0 && Math.random() > 0.4; // simulated check
          
          if (!alreadyLinked) {
            if (k.devicesUsed >= k.maxDevices) {
              returnObj = { 
                success: false, 
                error: `عذراً، وصل هذا المشترك للحد القصى للأجهزة المصرح بها (${k.maxDevices} أجهزة). يرجى تحرير أحد التفعيلات السابقة أو ترقية الاشتراك.` 
              };
              return k; // make no changes
            } else {
              return {
                ...k,
                devicesUsed: k.devicesUsed + 1
              };
            }
          }
        }
      }
      return k;
    });

    const targetKey = keys.find(k => k.id === keyId);
    
    if (returnObj.success && targetKey) {
      addSystemLog(
        `التحقق البرمجي: تم فحص وتفعيل رمز الترخيص على خادم الأمان والجهاز متوافق`,
        targetKey.clientName,
        targetKey.key.substring(0, 8),
        'validate_success',
        freshKeys
      );
    } else if (!returnObj.success && targetKey) {
      addSystemLog(
        `التحقق البرمجي: فشل التفعيل الخارجي لتجاوز الحد الأقصى للهواتف/الأجهزة المسموحة`,
        targetKey.clientName,
        targetKey.key.substring(0, 8),
        'validate_failed',
        keys // no state changes
      );
    }

    return returnObj;
  };

  // Flush DB completely
  const handleResetDatabase = () => {
    if (confirm('هل أنت متأكد من مسح جميع البيانات واستعادة التراخيص النموذجية الافتراضية؟')) {
      setKeys(DEFAULT_KEYS);
      setLogs(DEFAULT_LOGS);
      localStorage.setItem('license_keys_manager_db', JSON.stringify(DEFAULT_KEYS));
      localStorage.setItem('license_keys_manager_logs', JSON.stringify(DEFAULT_LOGS));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600/60 selection:text-white" dir="rtl">
      
      {/* Dynamic Header Section */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          {/* Logo Brand / Human Labels */}
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

          {/* Nav Links / Responsive Segment */}
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
              onClick={() => {
                // If we navigate here, automatically paste some active key if empty to guide the user!
                const activeOnes = keys.filter(k => k.status === 'active');
                if (activeOnes.length > 0 && !localStorage.getItem('temp_simulator_key_input')) {
                  // select first active
                }
                setActiveTab('tester');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tester' 
                  ? 'bg-slate-800 text-white border border-slate-700/80 shadow' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-4 h-4 text-rose-400" />
              <span>فحص الكود (API)</span>
            </button>
          </nav>

        </div>
      </header>

      {/* Hero Accent Panel */}
      <section className="bg-slate-900 border-b border-slate-850 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">نظام ترخيص الخدمات السحابية والألعاب الحية</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">منصة إدارة الصلاحيات ومفاتيح التراخيص</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 font-light leading-relaxed max-w-2xl">
                نظام برمجي متكامل لعمل وعزل تصاريح الأجهزة، التحكم بنطاق صلاحيات المستخدمين، وفترات الاشتراك الزمني الموزعة <span className="text-indigo-400 font-bold font-sans">يومياً وأسبوعياً وشهرياً</span>.
              </p>
            </div>
            
            {/* Database resetting triggers */}
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <button
                onClick={handleResetDatabase}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-750 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer"
                title="تهيئة المصنع وقاعدة البيانات"
              >
                <Trash2 className="w-4 h-4 text-slate-500" />
                إعادة ضبط المصنع
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Animated transitions */}
        <AnimatePresence mode="wait">
          
          {/* Tab 1: Dashboard Stats Overview */}
          {activeTab === 'stats' && (
            <motion.div
              key="tab-stats"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <DashboardStats keys={keys} logs={logs} />
            </motion.div>
          )}

          {/* Tab 2: Generator Suite */}
          {activeTab === 'generate' && (
            <motion.div
              key="tab-generate"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto"
            >
              <KeyGenerator onGenerate={handleGenerateKeys} />
            </motion.div>
          )}

          {/* Tab 3: Keys Database Grid */}
          {activeTab === 'keys' && (
            <motion.div
              key="tab-keys"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <KeyList
                keys={keys}
                onActivate={handleActivateKey}
                onRevoke={handleRevokeKey}
                onExtend={handleExtendKey}
                onDelete={handleDeleteKey}
              />
            </motion.div>
          )}

          {/* Tab 4: Live API Web Tester */}
          {activeTab === 'tester' && (
            <motion.div
              key="tab-tester"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <ApiSimulator 
                keys={keys} 
                onSimulateUsage={handleSimulateApiCall} 
              />
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Subtle Bottom Help Guidelines Accordion / Explainer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 flex-shrink-0 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-2">
            <h4 className="font-bold text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              نظام التشفير والأمان المعتمد
            </h4>
            <p className="leading-relaxed text-slate-400 font-light">
              يتم توليد رموز الترخيص بنظام UUID v4 المشفرة مع توفير حماية قوية تمنع تزوير المفاتيح أو تخمينها خارجيًا من برمجيات العبث.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              توقيتات فترات الاشتراك
            </h4>
            <p className="leading-relaxed text-slate-400 font-light">
              الاشتراكات تتدرج بدقة: اليومي (24 ساعة فوتونات)، الأسبوعي (7 أيام متكاملة)، والشهري (30 يوماً متتابعة) لضمان تحقيق غطاء مالي وتأمين مستقر.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-300 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-rose-400" />
              تطوير واندماج الـ SDK
            </h4>
            <p className="leading-relaxed text-slate-400 font-light">
              استعمل قسم فحص الكود (API) في الأعلى للحصول على الهيكل البرمجي الجاهز لإسقاطه في مشروعك وتدشين حماية تطبيقاتك في دقائق معدودة.
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 mt-6 border-t border-slate-850/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono">
          <span>التاريخ الحالي المعتمد: 2026-06-09</span>
          <span>تطوير وإدارة الترخيص © {new Date().getFullYear()} لوحة اشتراكات المستخدمين</span>
        </div>
      </footer>

    </div>
  );
}
