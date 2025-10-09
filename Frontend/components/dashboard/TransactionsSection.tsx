import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileDown, Filter, Calendar, Search } from 'lucide-react';
import { apiGetTransactions } from '@/lib/api';

interface UiTransaction {
  id: string;
  name: string;
  date: string;
  time: string;
  category: string;
  amount: number;
  status: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export default function TransactionsSection() {
  const [transactions, setTransactions] = useState<UiTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiGetTransactions({ page: 1, limit: 20 });
        const ui = (res.data.transactions || []).map((t: any) => ({
          id: t._id,
          name: t.description,
          date: new Date(t.createdAt).toLocaleDateString(),
          time: new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: t.category,
          amount: t.type === 'income' || t.type === 'deposit' ? t.amount : -Math.abs(t.amount),
          status: t.status,
          icon: (() => () => null)(),
          color: t.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600',
        })) as UiTransaction[];
        setTransactions(ui);
      } catch (e: any) {
        setError(e?.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  return (
    <div className="lg:col-span-4"> {/* Changed from lg:col-span-2 to lg:col-span-3 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-slate-900">Recent Transactions</h2>
        <Button variant="outline" size="sm">
          <FileDown className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search transactions..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {transactions.map((transaction) => {
              const Icon = transaction.icon;
              return (
                <div key={transaction.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${transaction.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{transaction.name}</div>
                      <div className="text-sm text-slate-500">
                        {transaction.date} • {transaction.time} • {transaction.category}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount < 0 ? '-' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                    <div className="text-sm text-slate-500">{transaction.status}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}