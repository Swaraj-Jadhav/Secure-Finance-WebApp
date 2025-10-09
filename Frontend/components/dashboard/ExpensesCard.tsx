import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Receipt, FileText } from 'lucide-react';
import { apiGetExpenses } from '@/lib/api';

type Expense = {
  category: string;
  amount: number;
  percent: number;
};

interface ExpensesCardProps {
  expenses?: Expense[];
}

export default function ExpensesCard({ expenses: initialExpenses = [] }: ExpensesCardProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiGetExpenses({ page: 1, limit: 6 });
        // Map backend expenses to UI with percent approximation by share
        const list = res.data.expenses || [];
        const total = list.reduce((s: number, e: any) => s + (e.amount || 0), 0) || 1;
        const mapped = list.map((e: any) => ({
          category: e.category,
          amount: e.amount,
          percent: Math.round((e.amount / total) * 100),
        }));
        setExpenses(mapped);
      } catch {
        // keep initial mock if API fails
      }
    };
    load();
  }, []);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-green-600" />
          Monthly Expenses
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {expenses.map((expense, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">{expense.category}</span>
              <span className="text-sm font-bold text-slate-900">${expense.amount.toFixed(2)}</span>
            </div>
            <Progress value={expense.percent} className="h-2" />
          </div>
        ))}
        <Button variant="link" className="w-full mt-2">
          <FileText className="w-4 h-4 mr-2" />
          View Detailed Report
        </Button>
      </CardContent>
    </Card>
  );
}