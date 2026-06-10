import React, { useState, useEffect } from 'react';
import supabase from '../lib/supabase';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('admin@local');
  const [password, setPassword] = useState('ADREES1997adrees');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear any previous session on mount (optional)
    // supabase.auth.signOut();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await supabase.auth.signInWithPassword({ email, password });
      if (res.error) throw res.error;
      onLogin();
    } catch (err: any) {
      setError(err.message || 'خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4" dir="rtl">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">تسجيل دخول المشرف</h2>

        <label className="text-xs text-slate-400">البريد الإلكتروني</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 mt-1 mb-3 text-sm text-slate-200"
        />

        <label className="text-xs text-slate-400">كلمة المرور</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 mt-1 mb-3 text-sm text-slate-200"
        />

        {error && <div className="text-rose-400 text-sm mb-3">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl"
        >
          {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
        </button>

        <p className="text-xs text-slate-500 mt-3">ملاحظة: الحساب الافتراضي المقترح: <span className="font-mono">admin@local</span></p>
      </form>
    </div>
  );
}
