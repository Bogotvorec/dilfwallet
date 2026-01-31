import Layout from '@/components/Layout';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <div className="animate-fadeIn">
        {/* Hero section */}
        <div className="text-center py-16 md:py-24">
          <div className="text-7xl mb-6">💰</div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
            <span style={{
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>DILFwallet</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-8" style={{ color: 'var(--foreground-muted)' }}>
            Отслеживайте свой крипто-портфель с реальными ценами,
            рассчитывайте прибыль и управляйте транзакциями
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link href="/portfolio" className="btn-primary text-lg px-8 py-4">
                  📊 Мой портфолио
                </Link>
                <Link href="/transactions" className="btn-success text-lg px-8 py-4">
                  💱 Транзакции
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className="btn-primary text-lg px-8 py-4">
                  🚀 Начать бесплатно
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 text-lg font-medium rounded-lg transition-all duration-300"
                  style={{
                    border: '1px solid var(--accent-primary)',
                    color: 'var(--accent-primary)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'var(--accent-primary)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--accent-primary)';
                  }}
                >
                  Войти
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
          <div className="stat-card text-center">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Реальные цены
            </h3>
            <p style={{ color: 'var(--foreground-muted)' }}>
              Актуальные котировки через CoinGecko API с кешированием
            </p>
          </div>

          <div className="stat-card text-center">
            <div className="text-4xl mb-4">💹</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              P&L расчёт
            </h3>
            <p style={{ color: 'var(--foreground-muted)' }}>
              Автоматический расчёт прибыли и убытка по каждому активу
            </p>
          </div>

          <div className="stat-card text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Безопасность
            </h3>
            <p style={{ color: 'var(--foreground-muted)' }}>
              JWT-аутентификация и защита всех данных
            </p>
          </div>
        </div>

        {/* Supported coins */}
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
            Поддерживаемые криптовалюты
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'DOT', 'MATIC', 'AVAX'].map((coin) => (
              <span
                key={coin}
                className="crypto-symbol px-4 py-2 rounded-lg"
                style={{
                  background: 'var(--background-card)',
                  border: '1px solid rgba(99, 102, 241, 0.2)'
                }}
              >
                {coin}
              </span>
            ))}
            <span
              className="px-4 py-2 rounded-lg"
              style={{
                background: 'var(--background-card)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                color: 'var(--foreground-muted)'
              }}
            >
              И другие...
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
