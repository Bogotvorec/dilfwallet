import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import type { PortfolioSummary, PortfolioEntry, Transaction } from '@/types/portfolio';

export function usePortfolioSummary() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getPortfolioSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load portfolio summary');
      console.error('Portfolio summary error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  return { summary, loading, error, refresh: loadSummary };
}

export function usePortfolio() {
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getPortfolio();
      setEntries(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load portfolio');
      console.error('Portfolio error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const addEntry = async (data: {
    symbol: string;
    amount: number;
    purchase_price: number;
  }) => {
    try {
      await apiClient.addPortfolioEntry(data);
      await loadPortfolio(); // Обновляем список
      return true;
    } catch (err: any) {
      console.error('Add portfolio entry error:', err);
      throw err;
    }
  };

  return { entries, loading, error, refresh: loadPortfolio, addEntry };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getTransactions();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
      console.error('Transactions error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const createTransaction = async (data: {
    coin: string;
    quantity: number;
    price: number;
    type: 'buy' | 'sell';
    portfolio_entry_id: number;
  }) => {
    try {
      await apiClient.createTransaction(data);
      await loadTransactions(); // Обновляем список
      return true;
    } catch (err: any) {
      console.error('Create transaction error:', err);
      throw err;
    }
  };

  return { transactions, loading, error, refresh: loadTransactions, createTransaction };
}

