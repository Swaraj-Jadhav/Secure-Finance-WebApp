'use client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  auth?: boolean;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, auth = true } = options;
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  const token = auth ? (typeof window !== 'undefined' ? localStorage.getItem('secureBank_accessToken') : null) : null;

  // If auth required and no token, short-circuit to avoid hitting backend
  if (auth && !token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const err = await res.json();
      message = err?.message || message;
    } catch {}
    if (res.status === 401 && typeof window !== 'undefined') {
      // Clear tokens and redirect to login on auth failures
      localStorage.removeItem('secureBank_accessToken');
      localStorage.removeItem('secureBank_refreshToken');
      localStorage.removeItem('secureBank_user');
      localStorage.removeItem('secureBank_sessionTime');
      localStorage.removeItem('secureBank_lastLogin');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    throw new Error(message);
  }

  try {
    return (await res.json()) as T;
  } catch {
    return {} as T;
  }
}

// Auth
export async function apiLogin(identifier: string, password: string) {
  return apiFetch<{ success: boolean; data: { user: any; tokens: { accessToken: string; refreshToken: string; expiresIn: string } } }>(
    '/auth/login',
    { method: 'POST', auth: false, body: { identifier, password } }
  );
}

export async function apiLogout(refreshToken?: string) {
  return apiFetch<{ success: boolean }>(
    '/auth/logout',
    { method: 'POST', body: refreshToken ? { refreshToken } : {} }
  );
}

// Accounts
export async function apiGetAccounts(query: Record<string, string | number> = {}) {
  const qs = new URLSearchParams(query as any).toString();
  return apiFetch<{ success: boolean; data: { accounts: any[] } }>(`/accounts${qs ? `?${qs}` : ''}`);
}

export async function apiCreateAccount(payload: { accountName: string; accountType: string; category: string; initialBalance?: number; currency?: string; }) {
  return apiFetch<{ success: boolean; data: { account: any } }>(
    '/accounts',
    { method: 'POST', body: payload }
  );
}

export async function apiDeleteAccount(id: string) {
  return apiFetch<{ success: boolean }>(`/accounts/${id}`, { method: 'DELETE' });
}

export async function apiTransfer(payload: { fromAccountId: string; toAccountId: string; amount: number; description?: string; }) {
  return apiFetch<{ success: boolean; data: { transaction: any } }>(
    '/accounts/transfer',
    { method: 'POST', body: payload }
  );
}

// Transactions
export async function apiGetTransactions(query: Record<string, string | number> = {}) {
  const qs = new URLSearchParams(query as any).toString();
  return apiFetch<{ success: boolean; data: { transactions: any[]; pagination?: any } }>(`/transactions${qs ? `?${qs}` : ''}`);
}

// Expenses
export async function apiGetExpenses(query: Record<string, string | number> = {}) {
  const qs = new URLSearchParams(query as any).toString();
  return apiFetch<{ success: boolean; data: { expenses: any[]; pagination?: any } }>(`/expenses${qs ? `?${qs}` : ''}`);
}


