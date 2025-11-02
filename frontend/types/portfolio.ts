export interface PortfolioEntry {
  id: number;
  symbol: string;
  amount: number;
  purchase_price: number;
}

export interface PortfolioSummary {
  items: PortfolioItem[];
  total_invested: number;
  total_current_value: number;
  total_profit_loss: number;
  total_profit_loss_percentage: number;
}

export interface PortfolioItem {
  symbol: string;
  amount: number;
  purchase_price: number;
  current_price: number | null;
  total_value: number | null;
  profit_loss: number | null;
  profit_loss_percentage: number | null;
}

export interface Transaction {
  id: number;
  portfolio_entry_id: number;
  coin: string;
  quantity: number;
  price: number;
  type: 'buy' | 'sell';
  date: string;
}

