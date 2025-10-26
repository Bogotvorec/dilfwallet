import Layout from '@/components/Layout';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="text-center text-white px-4">
          <h1 className="text-5xl font-bold mb-4">💰 DILFwallet</h1>
          <p className="text-xl mb-8">
            Управляйте своим криптовалютным портфелем легко и эффективно
          </p>
          <div className="space-x-4">
            {isAuthenticated ? (
              <Link
                href="/portfolio"
                className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition"
              >
                Перейти к портфолио
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition"
                >
                  Начать
                </Link>
                <Link
                  href="/login"
                  className="inline-block px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition"
                >
                  Войти
                </Link>
              </>
            )}
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-2">📊 Аналитика</h3>
              <p>Отслеживайте прибыль и убытки в реальном времени</p>
            </div>
            <div className="bg-white/10 backdrop-blur p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-2">💹 Цены в реальном времени</h3>
              <p>Актуальные цены криптовалют через CoinGecko API</p>
            </div>
            <div className="bg-white/10 backdrop-blur p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-2">📈 История транзакций</h3>
              <p>Полная история всех ваших сделок</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
