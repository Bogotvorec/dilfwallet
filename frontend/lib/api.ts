import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

// Определяем backend URL в зависимости от окружения
const getBackendUrl = () => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('-3000.app.github.dev')) {
      return window.location.origin.replace('-3000.app.github.dev', '-8000.app.github.dev');
    }
  }

  return 'http://localhost:8000';
};

const API_BASE_URL = getBackendUrl();

// ========== Token Storage ==========

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// ========== Types ==========

export interface Portfolio {
  id: number;
  name: string;
  type: 'crypto' | 'stocks' | 'etf' | 'metals';
  created_at: string;
}

export interface PortfolioEntry {
  id: number;
  portfolio_id: number;
  symbol: string;
  amount: number;
  purchase_price: number;
}

export interface Transaction {
  id: string;
  symbol: string;
  quantity: number;
  price: number;
  type: 'buy' | 'sell';
  date: string;
  portfolio_entry_id?: number;
}

export interface TransactionWithPL extends Transaction {
  current_price: number | null;
  invested: number;
  current_value: number | null;
  profit_loss: number | null;
  profit_loss_percentage: number | null;
}

export interface PortfolioItemSummary {
  symbol: string;
  amount: number;
  avg_purchase_price: number;
  current_price: number | null;
  total_value: number | null;
  profit_loss: number | null;
  profit_loss_percentage: number | null;
  transactions: TransactionWithPL[];
}

export interface PortfolioSummary {
  portfolio: Portfolio;
  items: PortfolioItemSummary[];
  total_invested: number;
  total_current_value: number;
  total_profit_loss: number;
  total_profit_loss_percentage: number;
}

export interface BudgetCategory {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
}

export interface BudgetTransaction {
  id: number;
  category_id: number;
  amount: number;
  description: string;
  date: string;
  category?: BudgetCategory;
}

export interface BudgetSummary {
  total_income: number;
  total_expense: number;
  balance: number;
  transactions: BudgetTransaction[];
  categories: BudgetCategory[];
}

// Chart Data Types
export interface CategoryChartData {
  category: string;
  total: number;
  icon: string;
}

export interface DailyTotals {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

export interface BudgetChartData {
  expense_by_category: CategoryChartData[];
  income_by_category: CategoryChartData[];
  daily_totals: DailyTotals[];
  total_income: number;
  total_expense: number;
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // ===== Request interceptor: attach access token =====
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // ===== Response interceptor: auto-refresh on 401 =====
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Network error
        if (error.code === 'ERR_NETWORK') {
          console.error('Network error - backend may not be running on', API_BASE_URL);
          error.message = 'Не удается подключиться к серверу.';
          return Promise.reject(error);
        }

        // If 401 and not a retry, and not login/register/refresh endpoint
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/login') &&
          !originalRequest.url?.includes('/register') &&
          !originalRequest.url?.includes('/refresh')
        ) {
          if (this.isRefreshing) {
            // Queue the request while refresh is in progress
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            this.isRefreshing = false;
            this.handleLogout();
            return Promise.reject(error);
          }

          try {
            const response = await axios.post(`${API_BASE_URL}/refresh`, {
              refresh_token: refreshToken,
            });

            const newAccessToken = response.data.access_token;
            // Update stored token (keep same refresh token)
            if (typeof window !== 'undefined') {
              localStorage.setItem(TOKEN_KEY, newAccessToken);
            }

            // Retry all queued requests
            this.failedQueue.forEach(({ resolve }) => resolve(newAccessToken));
            this.failedQueue = [];
            this.isRefreshing = false;

            // Retry the original request
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed — force logout
            this.failedQueue.forEach(({ reject }) => reject(refreshError));
            this.failedQueue = [];
            this.isRefreshing = false;
            this.handleLogout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private handleLogout(): void {
    clearTokens();
    if (typeof window !== 'undefined') {
      // Dispatch custom event so AuthProvider can react
      window.dispatchEvent(new Event('auth:logout'));
    }
  }

  // ========== Auth ==========

  async register(email: string, password: string) {
    const response = await this.client.post('/register', { email, password });
    return response.data;
  }

  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await this.client.post('/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/me');
    return response.data;
  }

  // ========== Portfolios ==========

  async getPortfolios(): Promise<Portfolio[]> {
    const response = await this.client.get('/portfolios');
    return response.data;
  }

  async createPortfolio(name: string, type: string): Promise<Portfolio> {
    const response = await this.client.post('/portfolios', { name, type });
    return response.data;
  }

  async deletePortfolio(id: number) {
    const response = await this.client.delete(`/portfolios/${id}`);
    return response.data;
  }

  async getPortfolioSummary(portfolioId: number): Promise<PortfolioSummary> {
    const response = await this.client.get(`/portfolios/${portfolioId}/summary`);
    return response.data;
  }

  // ========== Portfolio Entries ==========

  async getPortfolioEntries(portfolioId: number): Promise<PortfolioEntry[]> {
    const response = await this.client.get(`/portfolios/${portfolioId}/entries`);
    return response.data;
  }

  async addPortfolioEntry(portfolioId: number, data: {
    symbol: string;
    amount: number;
    purchase_price: number;
  }): Promise<PortfolioEntry> {
    const response = await this.client.post(`/portfolios/${portfolioId}/entries`, data);
    return response.data;
  }

  async deletePortfolioEntry(portfolioId: number, entryId: number) {
    const response = await this.client.delete(`/portfolios/${portfolioId}/entries/${entryId}`);
    return response.data;
  }

  // ========== Transactions ==========

  async getPortfolioTransactions(portfolioId: number): Promise<Transaction[]> {
    const response = await this.client.get(`/portfolios/${portfolioId}/transactions`);
    return response.data;
  }

  async createTransaction(portfolioId: number, data: {
    symbol: string;
    quantity: number;
    price: number;
    type: 'buy' | 'sell';
    portfolio_entry_id: number;
  }): Promise<Transaction> {
    const response = await this.client.post(`/portfolios/${portfolioId}/transactions`, data);
    return response.data;
  }

  // ========== Budget ==========

  async getBudgetCategories(): Promise<BudgetCategory[]> {
    const response = await this.client.get('/budget/categories');
    return response.data;
  }

  async createBudgetCategory(data: {
    name: string;
    type: 'income' | 'expense';
    icon: string;
  }): Promise<BudgetCategory> {
    const response = await this.client.post('/budget/categories', data);
    return response.data;
  }

  async deleteBudgetCategory(id: number) {
    const response = await this.client.delete(`/budget/categories/${id}`);
    return response.data;
  }

  async getBudgetTransactions(params?: {
    limit?: number;
    offset?: number;
    category_id?: number;
    type?: 'income' | 'expense';
  }): Promise<BudgetTransaction[]> {
    const response = await this.client.get('/budget/transactions', { params });
    return response.data;
  }

  async createBudgetTransaction(data: {
    category_id: number;
    amount: number;
    description?: string;
    date?: string;
  }): Promise<BudgetTransaction> {
    const response = await this.client.post('/budget/transactions', data);
    return response.data;
  }

  async deleteBudgetTransaction(id: number) {
    const response = await this.client.delete(`/budget/transactions/${id}`);
    return response.data;
  }

  async getBudgetSummary(period: 'week' | 'month' | 'year' | 'all' = 'month'): Promise<BudgetSummary> {
    const response = await this.client.get('/budget/summary', { params: { period } });
    return response.data;
  }

  // ========== Chart Data ==========

  async getBudgetChartData(period: 'week' | 'month' | 'year' | 'all' = 'month'): Promise<BudgetChartData> {
    const response = await this.client.get('/budget/chart-data', { params: { period } });
    return response.data;
  }

  // ========== Export ==========

  async exportBudgetCSV(period: 'week' | 'month' | 'year' | 'all' = 'month'): Promise<void> {
    const response = await this.client.get('/budget/export/csv', {
      params: { period },
      responseType: 'blob'
    });
    this.downloadFile(response.data, `budget_export_${period}.csv`, 'text/csv');
  }

  async exportBudgetJSON(period: 'week' | 'month' | 'year' | 'all' = 'month'): Promise<void> {
    const response = await this.client.get('/budget/export/json', {
      params: { period },
      responseType: 'blob'
    });
    this.downloadFile(response.data, `budget_export_${period}.json`, 'application/json');
  }

  async exportPortfolioCSV(portfolioId: number): Promise<void> {
    const response = await this.client.get(`/portfolios/${portfolioId}/export/csv`, {
      responseType: 'blob'
    });
    this.downloadFile(response.data, `portfolio_${portfolioId}.csv`, 'text/csv');
  }

  async exportPortfolioJSON(portfolioId: number): Promise<void> {
    const response = await this.client.get(`/portfolios/${portfolioId}/export/json`, {
      responseType: 'blob'
    });
    this.downloadFile(response.data, `portfolio_${portfolioId}.json`, 'application/json');
  }

  private downloadFile(data: Blob, filename: string, mimeType: string): void {
    const blob = new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const apiClient = new ApiClient();

// ========== CoinGecko Market Data ==========

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
  };

  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${url}?${query}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load markets');
  return (await res.json()) as CoinGeckoMarket[];
}