'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!email || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setError(null);
    setLoading(true);

    // Add timeout to prevent infinite loading
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      console.log('Attempting login...');
      
      timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      if (timeoutId) clearTimeout(timeoutId);
      console.log('Login response status:', response.status);

      const data = await response.json();
      console.log('Login response data:', data);

      if (response.ok) {
        // Success - store user email and navigate to dashboard
        console.log('Login successful, redirecting...');
        localStorage.setItem('userEmail', email);
        setLoading(false);
        // Small delay to ensure cookie is set
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 100);
      } else {
        // Error response
        setError(data.error || 'فشل تسجيل الدخول');
        setLoading(false);
      }
    } catch (err: any) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error('Login error:', err);
      
      if (err.name === 'AbortError') {
        setError('انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.');
      } else {
        setError(err.message || 'حدث خطأ أثناء تسجيل الدخول. تحقق من اتصال الإنترنت.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm p-8 bg-white shadow-lg rounded-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">تسجيل الدخول</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-slate-900"
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-slate-900"
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">
          ليس لديك حساب؟{' '}
          <Link href="/signup" className="font-bold text-slate-900">
            إنشاء حساب
          </Link>
        </p>
      </div>
    </div>
  );
}
