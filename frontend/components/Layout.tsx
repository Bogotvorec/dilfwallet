import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Navigation */}
      <nav style={{
        background: 'var(--background-secondary)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo and nav links */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center px-2 text-xl font-bold logo-glow" style={{ color: 'var(--foreground)' }}>
                <span className="text-2xl mr-2">💰</span>
                <span style={{
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>DILFwallet</span>
              </Link>

              {isAuthenticated && (
                <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
                  <Link
                    href="/portfolio"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300"
                    style={{ color: 'var(--foreground)' }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    📊 Портфолио
                  </Link>
                  <Link
                    href="/transactions"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300"
                    style={{ color: 'var(--foreground-muted)' }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                      e.currentTarget.style.color = 'var(--foreground)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--foreground-muted)';
                    }}
                  >
                    💱 Транзакции
                  </Link>
                </div>
              )}
            </div>

            {/* Right side - User info and auth buttons */}
            <div className="flex items-center">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm hidden sm:block" style={{ color: 'var(--foreground-muted)' }}>
                    {user?.email}
                  </span>
                  <button
                    onClick={logout}
                    className="btn-danger text-sm"
                  >
                    Выйти
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300"
                    style={{ color: 'var(--foreground-muted)' }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--foreground)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--foreground-muted)'}
                  >
                    Войти
                  </Link>
                  <Link
                    href="/register"
                    className="btn-primary text-sm"
                  >
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(99, 102, 241, 0.1)',
        padding: '2rem 0',
        marginTop: '4rem'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>
            💰 DILFwallet — Крипто-портфолио трекер
          </p>
        </div>
      </footer>
    </div>
  );
}
