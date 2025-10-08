import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus } from 'lucide-react';

export default function SavingsGoals({ savingsGoals }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {savingsGoals.map((goal, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">{goal.name}</span>
              <span className="text-sm text-slate-500">
                ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
              </span>
            </div>
            <Progress value={goal.percent} className="h-2" />
          </div>
        ))}
        <Button variant="outline" className="w-full mt-2">
          <Plus className="w-4 h-4 mr-2" />
          Add New Goal
        </Button>
      </CardContent>
    </Card>
  );
}