import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Play, 
  Cpu, 
  HelpCircle, 
  Code, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  Copy, 
  Check, 
  FileCode,
  ArrowRight
} from 'lucide-react';
import { LicenseKey } from '../types';

interface ApiSimulatorProps {
  keys: LicenseKey[];
  onSimulateUsage: (id: string, deviceUid: string) => { success: boolean; error?: string };
}

export default function ApiSimulator({ keys, onSimulateUsage }: ApiSimulatorProps) {
  const [inputKey, setInputKey] = useState('');
  const [deviceUid, setDeviceUid] = useState('device-pc-primary');
  const [activeTab, setActiveTab] = useState<'response' | 'curl' | 'nodejs' | 'python'>('response');
  const [copiedCode, setCopiedCode] = useState(false);

  // Simulated API response state
  const [isLoading, setIsLoading] = useState(false);
  const [responseResult, setResponseResult] = useState<{
    status: number;
    payload: any;
    errorType?: 'invalid' | 'revoked' | 'expired' | 'device_limit' | 'none';
  } | null>(null);

  // Helper: Find target key statistics
  const handleVerify = () => {
    setIsLoading(true);
    setResponseResult(null);

    setTimeout(() => {
      const trimmed = inputKey.trim();
      const targetKey = keys.find(k => k.key === trimmed);

      if (!targetKey) {
        setResponseResult({
          status: 404,
          errorType: 'invalid',
          payload: {
            success: false,
            error: "ERR_INVALID_LICENSE_KEY",
            message: "مفتاح الترخيص غير موجود في قاعدة بيانات النظام. يرجى مراجعة التهجئة والرموز.",
            timestamp: new Date().toISOString()
          }
        });
        setIsLoading(false);
        return;
      }

      // Check revoked
      if (targetKey.status === 'revoked') {
        setResponseResult({
          status: 403,
          errorType: 'revoked',
          payload: {
            success: false,
            error: "ERR_LICENSE_REVOKED",
            message: "تم إلغاء صلاحيات هذا المفتاح من قبل لوحة الإدارة. اتصل بالدعم الفني.",
            clientName: targetKey.clientName,
            revokedAt: targetKey.createdAt, // simulated timestamp
            timestamp: new Date().toISOString()
          }
        });
        setIsLoading(false);
        return;
      }

      // Check expired
      const now = new Date();
      if (targetKey.expiresAt && new Date(targetKey.expiresAt) < now) {
        setResponseResult({
          status: 401,
          errorType: 'expired',
          payload: {
            success: false,
            error: "ERR_LICENSE_EXPIRED",
            message: "عذراً، لقد انتهت صلاحية هذا الاشتراك المعتمد. يرجى التمديد أو شراء مفتاح جديد.",
            clientName: targetKey.clientName,
            expiredAt: targetKey.expiresAt,
            plan: targetKey.duration,
            timestamp: new Date().toISOString()
          }
        });
        setIsLoading(false);
        return;
      }

      // Try simulated usage tracking (handles unused status transition + device check)
      const execution = onSimulateUsage(targetKey.id, deviceUid);

      if (!execution.success) {
        setResponseResult({
          status: 429,
          errorType: 'device_limit',
          payload: {
            success: false,
            error: "ERR_DEVICE_LIMIT_EXCEEDED",
            message: execution.error || "تجاوزت الحد الأقصى للمعدات المصرح لها باستخدام هذا المفتاح.",
            clientName: targetKey.clientName,
            maxDevicesAllowed: targetKey.maxDevices,
            currentDevicesRecorded: targetKey.devicesUsed,
            timestamp: new Date().toISOString()
          }
        });
        setIsLoading(false);
        return;
      }

      // Successful activation/validation report
      // Fetch fresh key attributes after activation
      const freshKey = keys.find(k => k.id === targetKey.id)!;
      const hoursRemaining = freshKey.expiresAt 
        ? Math.max(0, Math.ceil((new Date(freshKey.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)))
        : 0;

      setResponseResult({
        status: 200,
        errorType: 'none',
        payload: {
          success: true,
          license_status: "ACTIVE",
          client_name: freshKey.clientName,
          key_signature: trimmed.substring(0, 8) + "-****-****-" + trimmed.substring(trimmed.length - 4),
          duration_plan: freshKey.duration,
          hours_left: hoursRemaining,
          days_left: Math.ceil(hoursRemaining / 24),
          registered_hardware_id: deviceUid,
          device_slot_used: `${freshKey.devicesUsed}/${freshKey.maxDevices === 999 ? '∞' : freshKey.maxDevices}`,
          granted_permissions: freshKey.permissions,
          activated_timestamp: freshKey.activatedAt,
          expires_timestamp: freshKey.expiresAt,
          timestamp: new Date().toISOString()
        }
      });
      setIsLoading(false);
    }, 900);
  };

  // Integration codes strings
  const getCurlCode = () => {
    return `curl -X POST "${window.location.origin}/api/licenses/verify" \\
  -H "Content-Type: application/json" \\
  -d '{
    "license_key": "${inputKey.trim() || 'YOUR_LICENSE_KEY'}",
    "hwid_fingerprint": "${deviceUid}"
  }'`;
  };

  const getNodeJsCode = () => {
    return `const axios = require('axios');

async function checkSubscription() {
  try {
    const response = await axios.post('/api/licenses/verify', {
      license_key: "${inputKey.trim() || 'YOUR_LICENSE_KEY'}",
      hwid_fingerprint: "${deviceUid}"
    });
    
    if (response.data.success) {
      console.log(\`✅ تم تفعيل الاشتراك بنجاح للعميل: \${response.data.client_name}\`);
      console.log(\`الخدمات المتاحة: \${response.data.granted_permissions.join(', ')}\`);
    }
  } catch (error) {
    console.error('❌ خطأ في التحقق من المفتاح:', error.response.data.message);
  }
}

checkSubscription();`;
  };

  const getPythonCode = () => {
    return `import requests

def verify_license():
    url = "/api/licenses/verify"
    payload = {
        "license_key": "${inputKey.trim() || 'YOUR_LICENSE_KEY'}",
        "hwid_fingerprint": "${deviceUid}"
    }
    
    try:
        response = requests.post(url, json=payload)
        data = response.json()
        
        if data.get("success"):
            print(f"✅ مرخص للاستعمال. المستخدم: {data['client_name']}")
            print(f"الصلاحيات الممنوحة: {data['granted_permissions']}")
        else:
            print(f"❌ الترخيص مرفوض: {data['message']}")
    except Exception as e:
        print("خطأ أثناء الاتصال بالخادم:", e)

verify_license()`;
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="api-simulator-section">
      
      {/* Left Column: API Form Controls */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
        <div className="space-y-6">
          
          {/* Section title */}
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-400 font-mono" />
              منصة اختبار ومعاينة الـ API
            </h2>
            <p className="text-xs text-slate-500 mt-1">محاكاة عملية تفعيل اشتراك العميل والتحقق من صلاحيتها برمجياً</p>
          </div>

          {/* Key Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">قم بلصق مفتاح الترخيص هنا</label>
            <input
              type="text"
              value={inputKey}
              onChange={e => setInputKey(e.target.value)}
              placeholder="مثال: e281a8ca-375a-4b95-a20c-..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono"
            />
            <p className="text-[10px] text-slate-500">انسخ أحد المفاتيح التي قمت بتوليدها من الجدول أعلاه والصقه هنا لبدء محاكاة عملية التحقق.</p>
          </div>

          {/* Device Fingerprint Lock Emulator */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              اختيار معرف الجهاز (Hardware HWID Fingerprint)
            </label>
            <div className="grid grid-cols-3 gap-2" id="hwid-simulator-grid">
              {[
                { id: 'device-pc-primary', name: 'الكمبيوتر الرئيسي', desc: 'PC' },
                { id: 'device-phone-ios', name: 'هاتف ذكي iOS', desc: 'iPhone' },
                { id: 'device-laptop-study', name: 'حاسوب الدراسة', desc: 'Laptop' },
              ].map(dev => (
                <button
                  type="button"
                  key={dev.id}
                  onClick={() => setDeviceUid(dev.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    deviceUid === dev.id 
                      ? 'border-indigo-500/80 bg-indigo-500/5 text-indigo-300 shadow-md' 
                      : 'border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className="text-[11px] font-bold block">{dev.name}</span>
                  <span className="text-[9px] text-slate-600 block mt-1 font-mono uppercase">{dev.desc}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500">يمكّنك من اختبار حظر المفاتيح عند تفعيلها على أجهزة متعددة تتجاوز الحد المسموح.</p>
          </div>

        </div>

        {/* Action Button */}
        <div className="pt-6 border-t border-slate-800/60 mt-6 md:mt-0">
          <button
            onClick={handleVerify}
            disabled={isLoading || !inputKey.trim()}
            className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !inputKey.trim() 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-transparent' 
                : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg shadow-indigo-500/10'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                جاري استدعاء خادم التحقق اللاسلكي...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-white" />
                إرسال طلب التحقق (API Verify Key)
              </>
            )}
          </button>
        </div>

      </div>

      {/* Right Column: Terminal Response / Docs */}
      <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col h-[460px] overflow-hidden" id="terminal-screen">
        
        {/* Terminal Header */}
        <div className="bg-slate-900 px-5 py-4 border-b border-slate-800/80 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-xs text-slate-400 font-mono ml-2">Console v1.0.4</span>
          </div>

          {/* Tabs switch */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800/80">
            <button
              onClick={() => setActiveTab('response')}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                activeTab === 'response' ? 'bg-indigo-600 text-white font-mono' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              استجابة الـ JSON
            </button>
            <button
              onClick={() => setActiveTab('curl')}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                activeTab === 'curl' ? 'bg-indigo-600 text-white font-mono' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              cURL
            </button>
            <button
              onClick={() => setActiveTab('nodejs')}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                activeTab === 'nodejs' ? 'bg-indigo-600 text-white font-mono' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Node.js
            </button>
            <button
              onClick={() => setActiveTab('python')}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                activeTab === 'python' ? 'bg-indigo-600 text-white font-mono' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Python
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 overflow-auto p-5 font-mono text-xs text-slate-300 leading-relaxed relative flex flex-col justify-between">
          
          {/* Render Tab Contents */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'response' && (
                <motion.div
                  key="response-tab"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  {responseResult ? (
                    <div className="space-y-4">
                      
                      {/* Interactive Visual Status Bar */}
                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        {responseResult.errorType === 'none' && (
                          <>
                            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                              <CheckCircle2 className="w-5 h-5 animate-pulse" />
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-emerald-400 text-xs font-bold block">مفتاح مصرح به وفعال (200 OK)</span>
                              <span className="text-[10px] text-slate-400 block font-sans">العميل: {responseResult.payload.client_name} - يتبقى {responseResult.payload.days_left} يوم اشتراك</span>
                            </div>
                          </>
                        )}
                        {responseResult.errorType === 'invalid' && (
                          <>
                            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                              <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-rose-400 text-xs font-bold block">مرفوض: ترخيص غير صالح (404 NOT FOUND)</span>
                              <span className="text-[10px] text-slate-400 block font-sans">السيرفر لم يستدل على هذا الرقم في قاعدة البيانات.</span>
                            </div>
                          </>
                        )}
                        {responseResult.errorType === 'revoked' && (
                          <>
                            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                              <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-rose-400 text-xs font-bold block">مرفوض: ترخيص ملغي (403 FORBIDDEN)</span>
                              <span className="text-[10px] text-slate-400 block font-sans">تمت مصادرة هذا المفتاح وسحبه من لوحة الإدارة لمخالفة الشروط.</span>
                            </div>
                          </>
                        )}
                        {responseResult.errorType === 'expired' && (
                          <>
                            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                              <Clock className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-amber-500 text-xs font-bold block">مرفوض: ترخيص منتهي الصلاحية (401 UNAUTHORIZED)</span>
                              <span className="text-[10px] text-slate-400 block font-sans">انتهت صلاحية الاشتراك الزمني الممنوح لهذا المفتاح.</span>
                            </div>
                          </>
                        )}
                        {responseResult.errorType === 'device_limit' && (
                          <>
                            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                              <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-rose-400 text-xs font-bold block">مرفوض: تخطي حد الأجهزة (429 TOO MANY REQUESTS)</span>
                              <span className="text-[10px] text-slate-400 block font-sans">هذا المفتاح مستعمل حالياً على أجهزة أخرى بحد التفعيل الأقصى.</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Raw Response Tree */}
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block mb-1">JSON HTTP Payload:</span>
                        <pre className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl text-sky-300 overflow-x-auto text-[11px] selection:bg-indigo-600">
                          {JSON.stringify(responseResult.payload, null, 2)}
                        </pre>
                      </div>

                    </div>
                  ) : (
                    <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-slate-600 gap-3 text-center">
                      <Terminal className="w-12 h-12 text-slate-800 animate-pulse" />
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400 font-sans">بانتظار تنفيذ استدعاء التحقق من المفتاح...</p>
                        <p className="text-[10px] text-slate-500 font-sans">أدخل مفتاح ترخيص، حدد معرف جهاز، ثم اضغط على زر الإرسال باليسار.</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'curl' && (
                <motion.div
                  key="curl-tab"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-indigo-400 font-sans">استدعاء API عبر الخادم الطرفي بـ cURL</span>
                    <button
                      onClick={() => handleCopyCode(getCurlCode())}
                      className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px] font-sans">{copiedCode ? 'تم النسخ' : 'نسخ الكود'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-yellow-200 overflow-x-auto text-[11px] whitespace-pre-wrap select-all">
                    {getCurlCode()}
                  </pre>
                </motion.div>
              )}

              {activeTab === 'nodejs' && (
                <motion.div
                  key="nodejs-tab"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-indigo-400 font-sans">برمجة التحقق باستخدام Node.js بـ Axios</span>
                    <button
                      onClick={() => handleCopyCode(getNodeJsCode())}
                      className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px] font-sans">{copiedCode ? 'تم النسخ' : 'نسخ الكود'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-emerald-300 overflow-x-auto text-[11px] select-all">
                    {getNodeJsCode()}
                  </pre>
                </motion.div>
              )}

              {activeTab === 'python' && (
                <motion.div
                  key="python-tab"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-indigo-400 font-sans">برمجة التحقق باستخدام مكتبة Requests في Python</span>
                    <button
                      onClick={() => handleCopyCode(getPythonCode())}
                      className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px] font-sans">{copiedCode ? 'تم النسخ' : 'نسخ الكود'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-sky-200 overflow-x-auto text-[11px] select-all">
                    {getPythonCode()}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer of terminal screen showing connection diagnostics */}
          <div className="border-t border-slate-850 pt-4 mt-6 flex items-center justify-between text-[10px] text-slate-500 font-sans flex-shrink-0">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              الخادم نشط: 0.0.0.0:3000
            </span>
            <span>الاستجابة التقريبية: 42ms</span>
          </div>

        </div>

      </div>

    </div>
  );
}
