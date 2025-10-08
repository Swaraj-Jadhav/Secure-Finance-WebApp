import { 
  Bell, User, Send, FileText, Shield, Clock, Monitor, 
  TrendingUp, ArrowUpDown, FileDown, Filter, Calendar, 
  Search, ShoppingCart, ArrowDownUp, Plus, Zap, 
  PiggyBank, TrendingDown, Bolt, Receipt, Car, 
  Film, MoreHorizontal 
} from 'lucide-react';

export const accounts = [
  {
    id: 1,
    name: 'Primary Checking',
    number: '****1234',
    balance: 15420.50,
    icon: '💳',
    color: 'bg-blue-500'
  },
  {
    id: 2,
    name: 'High Yield Savings',
    number: '****5678',
    balance: 45780.25,
    icon: '💰',
    color: 'bg-green-600'
  },
  {
    id: 3,
    name: 'Investment Portfolio',
    number: '****9012',
    balance: 128950.75,
    icon: '📈',
    color: 'bg-purple-500'
  },
  {
    id: 4,
    name: 'Business Account',
    number: '****3456',
    balance: 32100.00,
    icon: '💼',
    color: 'bg-orange-600'
  }
];

export const transactions = [
  {
    id: 1,
    name: 'Internal Transfer',
    date: '2025-01-20',
    time: '14:32',
    category: 'Transfer',
    amount: -500.00,
    status: 'Completed',
    icon: ArrowUpDown,
    color: 'bg-red-100 text-red-600'
  },
  {
    id: 2,
    name: 'Amazon Marketplace',
    date: '2025-01-20',
    time: '10:15',
    category: 'Shopping',
    amount: -89.99,
    status: 'Completed',
    icon: ShoppingCart,
    color: 'bg-red-100 text-red-600'
  },
  {
    id: 3,
    name: 'Salary Direct Deposit',
    date: '2025-01-19',
    time: '16:45',
    category: 'Income',
    amount: 3500.00,
    status: 'Completed',
    icon: TrendingDown,
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 4,
    name: 'Electric Company',
    date: '2025-01-19',
    time: '09:22',
    category: 'Utilities',
    amount: -125.50,
    status: 'Completed',
    icon: Bolt,
    color: 'bg-red-100 text-red-600'
  },
  {
    id: 5,
    name: 'Stock Purchase - AAPL',
    date: '2025-01-18',
    time: '13:10',
    category: 'Investment',
    amount: -1200.00,
    status: 'Completed',
    icon: TrendingUp,
    color: 'bg-red-100 text-red-600'
  }
];

export const expenses = [
  { category: 'Shopping', amount: 450.75, percent: 30 },
  { category: 'Utilities', amount: 320.50, percent: 21 },
  { category: 'Food & Dining', amount: 280.25, percent: 19 },
  { category: 'Transportation', amount: 195.00, percent: 13 },
  { category: 'Entertainment', amount: 150.75, percent: 10 },
  { category: 'Other', amount: 402.75, percent: 27 }
];

export const savingsGoals = [
  { name: 'Emergency Fund', current: 8500, target: 10000, percent: 85 },
  { name: 'Vacation Fund', current: 2300, target: 5000, percent: 46 },
  { name: 'New Car', current: 12000, target: 25000, percent: 48 }
];