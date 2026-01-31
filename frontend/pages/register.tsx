import { useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import Layout from '@/components/Layout';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);

    try {
      await register(email, password);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Ошибка регистрации. Попробуйте другой email.');
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
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
              Создать аккаунт
            </h2>
            <p style={{ color: 'var(--foreground-muted)' }} className="mt-2">
              Начните отслеживать свои криптоактивы
            </p>
          </div>

          {/* Register form */}
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
                    autoComplete="new-password"
                    required
                    className="input-dark pr-12"
                    placeholder="Минимум 6 символов"
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

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>
                  Подтвердите пароль
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="input-dark pr-12"
                    placeholder="Повторите пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-xl"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
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
                    Регистрация...
                  </span>
                ) : (
                  '🚀 Зарегистрироваться'
                )}
              </button>

              <div className="text-center pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ color: 'var(--foreground-muted)' }}>Уже есть аккаунт? </span>
                <Link
                  href="/login"
                  className="font-medium hover:underline"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Войти
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
