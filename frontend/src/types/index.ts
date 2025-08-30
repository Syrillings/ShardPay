/* eslint-disable @typescript-eslint/no-explicit-any */
// Type definitions for ShardPay wallet interface

export interface WalletState {
  address: string | null;
  balance: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  chainId: string | null; 
}

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  reactions?: string[];
  chartData?: ChartData;
}

export interface ChartData {
  type: 'pie' | 'line' | 'heatmap';
  data: any;
  title: string;
}

export interface Transaction {
  id: string;
  type: 'payment' | 'save' | 'split' | 'receive';
  amount: string;
  currency: string;
  to?: string;
  from?: string;
  memo?: string;
  date: Date;
  status: 'pending' | 'success' | 'failed';
  hash?: string;
}

export interface VaultSummary {
  goal: string;
  saved: string;
  progress: number;
  microSaveEnabled: boolean;
  isLoading: boolean;
}

export interface SplitParticipant {
  id: string;
  name: string;
  share: number;
  owedAmount: string;
  walletAddress?: string;
}

export interface PaymentFormData {
  to: string;
  amount: string;
  memo: string;
}

export interface Trend {
  id: string;
  title: string;
  value: string;
  change: number;
  type: 'category' | 'tip' | 'save';
}