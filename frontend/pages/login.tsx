import { useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import Layout from '@/components/Layout';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 animate-fadeIn">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
              Вход в аккаунт
            </h2>
            <p style={{ color: 'var(--foreground-muted)' }} className="mt-2">
              Войдите, чтобы управлять портфолио
            </p>
          </div>

          {/* Login form */}
          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="error-message text-sm animate-fadeIn">
                  ⚠️ {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-dark"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>
                  Пароль
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="input-dark pr-12"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-xl"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-center"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="loader w-5 h-5 mr-2" style={{ borderWidth: '2px' }}></div>
                    Вход...
                  </span>
                ) : (
                  '🚀 Войти'
                )}
              </button>

              <div className="text-center pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ color: 'var(--foreground-muted)' }}>Нет аккаунта? </span>
                <Link
                  href="/register"
                  className="font-medium hover:underline"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Зарегистрироваться
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
