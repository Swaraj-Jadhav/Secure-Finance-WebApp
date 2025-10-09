'use client'
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, FileText, MoreHorizontal, Plus, Trash2, CreditCard, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiCreateAccount, apiDeleteAccount, apiGetAccounts, apiTransfer } from '@/lib/api';

interface UiAccount {
  id: string;
  name: string;
  number: string;
  balance: number;
  icon: string;
  color: string;
  type: 'primary' | 'virtual';
  category?: string;
  createdAt?: string;
}

export default function AccountsSection() {
  const [accounts, setAccounts] = useState<UiAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    category: 'savings',
    initialBalance: 0
  });
  const [balanceError, setBalanceError] = useState('');

  // Account categories with icons and colors
  const accountCategories = [
    { value: 'savings', label: 'Savings Account', icon: '💰', color: 'bg-green-500' },
    { value: 'investment', label: 'Investment Account', icon: '📈', color: 'bg-purple-500' },
    { value: 'travel', label: 'Travel Fund', icon: '✈️', color: 'bg-orange-500' },
    { value: 'emergency', label: 'Emergency Fund', icon: '🛡️', color: 'bg-red-500' },
    { value: 'education', label: 'Education Fund', icon: '🎓', color: 'bg-indigo-500' },
    { value: 'business', label: 'Business Account', icon: '💼', color: 'bg-gray-600' },
    { value: 'personal', label: 'Personal Account', icon: '👤', color: 'bg-pink-500' }
  ];

  // Initial load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setActionError('');
      try {
        const res = await apiGetAccounts();
        const ui = (res.data.accounts || []).map((a: any) => ({
          id: a._id,
          name: a.accountName,
          number: `****${String(a.accountNumber || '').slice(-4)}`,
          balance: a.balance,
          icon: a.metadata?.icon || (a.accountType === 'primary' ? '💳' : '💰'),
          color: a.metadata?.color || (a.accountType === 'primary' ? 'bg-blue-500' : 'bg-green-600'),
          type: (a.accountType === 'primary' ? 'primary' : 'virtual') as UiAccount['type'],
          category: a.category,
          createdAt: a.createdAt,
        })) as UiAccount[];
        setAccounts(ui);
      } catch (e: any) {
        setActionError(e?.message || 'Failed to load accounts');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Get primary and virtual accounts
  const primaryAccount = useMemo(() => accounts.find(account => account.type === 'primary'), [accounts]);
  const virtualAccounts = useMemo(() => accounts.filter(account => account.type === 'virtual'), [accounts]);

  // Get available balance in primary account
  const getAvailableBalance = (): number => {
    return primaryAccount?.balance || 0;
  };

  // Validate initial balance
  const validateBalance = (amount: number): boolean => {
    if (amount < 0) {
      setBalanceError('Initial balance cannot be negative');
      return false;
    }
    
    if (amount > getAvailableBalance()) {
      setBalanceError(`Cannot exceed available balance of $${getAvailableBalance().toLocaleString()}`);
      return false;
    }
    
    setBalanceError('');
    return true;
  };

  // Create new virtual account (backend)
  const createVirtualAccount = async () => {
    if (!newAccount.name.trim()) return;

    const initialBalance = newAccount.initialBalance || 0;
    
    if (!validateBalance(initialBalance)) {
      return;
    }

    try {
      setLoading(true);
      const payload = {
        accountName: newAccount.name,
        accountType: 'virtual',
        category: newAccount.category,
        initialBalance,
        currency: 'USD',
      };
      await apiCreateAccount(payload);
      const res = await apiGetAccounts();
      const ui = (res.data.accounts || []).map((a: any) => ({
        id: a._id,
        name: a.accountName,
        number: `****${String(a.accountNumber || '').slice(-4)}`,
        balance: a.balance,
        icon: a.metadata?.icon || (a.accountType === 'primary' ? '💳' : '💰'),
        color: a.metadata?.color || (a.accountType === 'primary' ? 'bg-blue-500' : 'bg-green-600'),
        type: (a.accountType === 'primary' ? 'primary' : 'virtual') as UiAccount['type'],
        category: a.category,
        createdAt: a.createdAt,
      })) as UiAccount[];
      setAccounts(ui);
      setNewAccount({ name: '', category: 'savings', initialBalance: 0 });
      setIsCreateDialogOpen(false);
      setBalanceError('');
    } catch (e: any) {
      setActionError(e?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  // Delete virtual account (backend) and return money to primary
  const deleteVirtualAccount = async (accountId: string) => {
    const virtualAccount = accounts.find(acc => acc.id === accountId && acc.type === 'virtual');
    if (!virtualAccount) return;
    if (!window.confirm(`Are you sure you want to delete "${virtualAccount.name}"? The remaining balance will be returned to your primary account.`)) return;
    try {
      setLoading(true);
      await apiDeleteAccount(accountId);
      const res = await apiGetAccounts();
      const ui = (res.data.accounts || []).map((a: any) => ({
        id: a._id,
        name: a.accountName,
        number: `****${String(a.accountNumber || '').slice(-4)}`,
        balance: a.balance,
        icon: a.metadata?.icon || (a.accountType === 'primary' ? '💳' : '💰'),
        color: a.metadata?.color || (a.accountType === 'primary' ? 'bg-blue-500' : 'bg-green-600'),
        type: (a.accountType === 'primary' ? 'primary' : 'virtual') as UiAccount['type'],
        category: a.category,
        createdAt: a.createdAt,
      })) as UiAccount[];
      setAccounts(ui);
    } catch (e: any) {
      setActionError(e?.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  // Transfer money between accounts (backend)
  const transferMoney = async (fromAccountId: string, toAccountId: string, amount: number) => {
    try {
      setLoading(true);
      await apiTransfer({ fromAccountId, toAccountId, amount });
      const res = await apiGetAccounts();
      const ui = (res.data.accounts || []).map((a: any) => ({
        id: a._id,
        name: a.accountName,
        number: `****${String(a.accountNumber || '').slice(-4)}`,
        balance: a.balance,
        icon: a.metadata?.icon || (a.accountType === 'primary' ? '💳' : '💰'),
        color: a.metadata?.color || (a.accountType === 'primary' ? 'bg-blue-500' : 'bg-green-600'),
        type: (a.accountType === 'primary' ? 'primary' : 'virtual') as UiAccount['type'],
        category: a.category,
        createdAt: a.createdAt,
      })) as UiAccount[];
      setAccounts(ui);
    } catch (e: any) {
      setActionError(e?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle balance input change with validation
  const handleBalanceChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    setNewAccount(prev => ({ ...prev, initialBalance: amount }));
    validateBalance(amount);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-slate-900">Your Accounts</h2>
        {actionError && (
          <span className="text-sm text-red-600">{actionError}</span>
        )}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Virtual Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Virtual Account</DialogTitle>
              <DialogDescription>
                Create a new virtual account for specific savings goals or expenses.
                Money will be transferred from your primary account.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="account-name">Account Name</Label>
                <Input
                  id="account-name"
                  placeholder="e.g., Vacation Fund, Emergency Savings..."
                  value={newAccount.name}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="account-category">Account Category</Label>
                <Select value={newAccount.category} onValueChange={(value) => setNewAccount(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="initial-balance">Initial Balance ($)</Label>
                  <span className="text-sm text-slate-500">
                    Available: ${getAvailableBalance().toLocaleString()}
                  </span>
                </div>
                <Input
                  id="initial-balance"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  max={getAvailableBalance()}
                  step="0.01"
                  value={newAccount.initialBalance || ''}
                  onChange={(e) => handleBalanceChange(e.target.value)}
                />
                {balanceError && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{balanceError}</AlertDescription>
                  </Alert>
                )}
                {newAccount.initialBalance > 0 && !balanceError && (
                  <div className="text-sm text-green-600">
                    Primary account balance after transfer: ${(getAvailableBalance() - newAccount.initialBalance).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false);
                setBalanceError('');
              }}>
                Cancel
              </Button>
              <Button 
                onClick={createVirtualAccount} 
                disabled={!newAccount.name.trim() || !!balanceError}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Primary Account */}
      {primaryAccount && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-slate-700">Primary Account</h3>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Main Account
            </Badge>
          </div>
          <Card className="hover:shadow-lg transition-shadow border-2 border-blue-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 ${primaryAccount.color} rounded-xl flex items-center justify-center text-2xl mb-3`}>
                  {primaryAccount.icon}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              <CardTitle className="text-lg flex items-center gap-2">
                {primaryAccount.name}
                <CreditCard className="w-4 h-4 text-blue-600" />
              </CardTitle>
              <CardDescription>{primaryAccount.number}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                ${primaryAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="mt-2 text-sm text-slate-500">
                Available for virtual accounts: ${getAvailableBalance().toLocaleString()}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                  const to = virtualAccounts[0]?.id;
                  const amtStr = prompt('Amount to transfer from Primary to first virtual account?','100');
                  const amt = amtStr ? parseFloat(amtStr) : 0;
                  if (to && amt > 0) transferMoney(primaryAccount.id, to, amt);
                }} disabled={loading || virtualAccounts.length === 0}>
                  <ArrowUpDown className="w-4 h-4 mr-1" />
                  Transfer
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <FileText className="w-4 h-4 mr-1" />
                  Statement
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Virtual Accounts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-700">Virtual Accounts</h3>
            <Badge variant="outline" className="text-slate-600">
              {virtualAccounts.length} accounts
            </Badge>
          </div>
          <div className="text-sm text-slate-500">
            Total in virtual accounts: ${virtualAccounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()}
          </div>
        </div>

        {virtualAccounts.length === 0 ? (
          <Card className="text-center py-12 border-2 border-dashed border-slate-200">
            <CardContent>
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-lg font-semibold text-slate-700 mb-2">No Virtual Accounts</h4>
              <p className="text-slate-500 mb-4 max-w-sm mx-auto">
                Create your first virtual account to organize your finances for specific goals or expenses.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Virtual Account
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {virtualAccounts.map((account) => (
              <Card key={account.id} className="hover:shadow-lg transition-shadow group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 ${account.color} rounded-xl flex items-center justify-center text-2xl mb-3`}>
                      {account.icon}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteVirtualAccount(account.id)}
                        title="Delete account and return funds to primary"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{account.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span>{account.number}</span>
                    {account.category && (
                      <Badge variant="outline" className="text-xs">
                        {account.category}
                      </Badge>
                    )}
                  </CardDescription>
                  {account.createdAt && (
                    <CardDescription className="text-xs">
                      Created: {new Date(account.createdAt).toLocaleDateString()}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <ArrowUpDown className="w-4 h-4 mr-1" />
                      Transfer
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <FileText className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}