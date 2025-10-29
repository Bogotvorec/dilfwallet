import axios, { AxiosInstance } from 'axios';

// Определяем backend URL в зависимости от окружения
const getBackendUrl = () => {
  // Если есть переменная окружения - используем её
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // В браузере проверяем Codespaces
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Если это Codespaces - меняем порт с 3000 на 8000
    if (hostname.includes('-3000.app.github.dev')) {
      return window.location.origin.replace('-3000.app.github.dev', '-8000.app.github.dev');
    }
  }
  
  // По умолчанию localhost
  return 'http://localhost:8000';
};

const API_BASE_URL = getBackendUrl();

console.log('🔧 API Base URL:', API_BASE_URL);

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Добавляем токен к каждому запросу
    this.client.interceptors.request.use((config) => {
      // Проверяем, что мы на клиенте (не SSR)
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Добавляем обработчик ошибок
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ERR_NETWORK') {
          console.error('Network error - backend may not be running on', API_BASE_URL);
          error.message = 'Не удается подключиться к серверу. Убедитесь, что backend запущен.';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(email: string, password: string) {
    const response = await this.client.post('/register', { email, password });
    return response.data;
  }

  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await this.client.post('/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/me');
    return response.data;
  }

  // Portfolio
  async getPortfolio() {
    const response = await this.client.get('/portfolio');
    return response.data;
  }

  async getPortfolioSummary() {
    const response = await this.client.get('/portfolio/summary');
    return response.data;
  }

  async addPortfolioEntry(data: {
    symbol: string;
    amount: number;
    purchase_price: number;
  }) {
    const response = await this.client.post('/portfolio', data);
    return response.data;
  }

  async deletePortfolioEntry(id: number) {
    const response = await this.client.delete(`/portfolio/${id}`);
    return response.data;
  }

  // Transactions
  async getTransactions() {
    const response = await this.client.get('/transactions');
    return response.data;
  }

  async createTransaction(data: {
    coin: string;
    quantity: number;
    price: number;
    type: 'buy' | 'sell';
    portfolio_entry_id?: number;
  }) {
    const response = await this.client.post('/transactions', data);
    return response.data;
  }
}

export const apiClient = new ApiClient();

// Public market data (CoinGecko)
export type CoinGeckoMarket = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
};

export async function fetchTopMarkets(perPage: number = 10): Promise<CoinGeckoMarket[]> {
  const url = 'https://api.coingecko.com/api/v3/coins/markets';
  const params = {
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: String(perPage),
    page: '1',
    price_change_percentage: '24h',
    sparkline: 'false',
  } as const;

  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${url}?${query}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load markets');
  return (await res.json()) as CoinGeckoMarket[];
}