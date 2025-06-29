
// Escrow Account Management System
// Manages escrow accounts for secure fund holding during investment transactions

import { supabase } from '@/integrations/supabase/client';

export type EscrowStatus = 'pending' | 'active' | 'funded' | 'released' | 'disputed' | 'cancelled';
export type EscrowType = 'investment' | 'payment' | 'milestone' | 'security';
export type TransactionType = 'deposit' | 'withdrawal' | 'release' | 'refund' | 'fee';

export interface EscrowAccount {
  id: string;
  account_number: string;
  opportunity_id: string;
  investor_id: string;
  entrepreneur_id: string;
  type: EscrowType;
  status: EscrowStatus;
  total_amount: number;
  available_balance: number;
  held_amount: number;
  currency: string;
  release_conditions: string[];
  auto_release_date: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EscrowTransaction {
  id: string;
  escrow_account_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  reference: string;
  description: string;
  status: string;
  transaction_date: string;
  processed_at: string | null;
  fee_amount: number | null;
  metadata: any;
  created_at: string;
}

export interface EscrowReleaseCondition {
  id: string;
  escrow_account_id: string;
  condition_type: string;
  description: string;
  is_met: boolean;
  required_documents: string[];
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export class EscrowService {
  // Accounts
  static async createAccount(data: {
    account_number: string;
    opportunity_id: string;
    investor_id: string;
    entrepreneur_id: string;
    type: EscrowType;
    status: EscrowStatus;
    total_amount: number;
    available_balance: number;
    held_amount: number;
    currency: string;
    release_conditions: string[];
  }): Promise<EscrowAccount> {
    const { data: account, error } = await supabase
      .from('escrow_accounts')
      .insert({
        account_number: data.account_number,
        opportunity_id: data.opportunity_id,
        investor_id: data.investor_id,
        entrepreneur_id: data.entrepreneur_id,
        type: data.type,
        status: data.status,
        total_amount: data.total_amount,
        available_balance: data.available_balance,
        held_amount: data.held_amount,
        currency: data.currency,
        release_conditions: data.release_conditions
      })
      .select()
      .single();
    if (error) throw error;
    return account as EscrowAccount;
  }

  static async getAccountsByUser(userId: string): Promise<EscrowAccount[]> {
    const { data, error } = await supabase
      .from('escrow_accounts')
      .select('*')
      .or(`investor_id.eq.${userId},entrepreneur_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as EscrowAccount[];
  }

  static async getAccount(id: string): Promise<EscrowAccount | null> {
    const { data, error } = await supabase
      .from('escrow_accounts')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as EscrowAccount;
  }

  // Transactions
  static async createTransaction(data: {
    escrow_account_id: string;
    type: TransactionType;
    amount: number;
    currency: string;
    reference: string;
    description: string;
    status: string;
    transaction_date: string;
  }): Promise<EscrowTransaction> {
    const { data: tx, error } = await supabase
      .from('escrow_transactions')
      .insert({
        escrow_account_id: data.escrow_account_id,
        type: data.type,
        amount: data.amount,
        currency: data.currency,
        reference: data.reference,
        description: data.description,
        status: data.status,
        transaction_date: data.transaction_date
      })
      .select()
      .single();
    if (error) throw error;
    return tx as EscrowTransaction;
  }

  static async getTransactions(accountId: string): Promise<EscrowTransaction[]> {
    const { data, error } = await supabase
      .from('escrow_transactions')
      .select('*')
      .eq('escrow_account_id', accountId)
      .order('transaction_date', { ascending: false });
    if (error) throw error;
    return (data || []) as EscrowTransaction[];
  }

  // Mock release conditions until table is created
  static async createReleaseCondition(data: {
    escrow_account_id: string;
    condition_type: string;
    description: string;
    due_date?: string;
  }): Promise<EscrowReleaseCondition> {
    // Mock implementation since table doesn't exist yet
    console.log('Creating mock release condition:', data);
    return {
      id: `mock-${Date.now()}`,
      escrow_account_id: data.escrow_account_id,
      condition_type: data.condition_type,
      description: data.description,
      is_met: false,
      required_documents: [],
      due_date: data.due_date || null,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  static async getReleaseConditions(accountId: string): Promise<EscrowReleaseCondition[]> {
    // Mock implementation since table doesn't exist yet
    console.log('Getting mock release conditions for account:', accountId);
    return [];
  }

  static async updateReleaseCondition(id: string, updates: {
    is_met?: boolean;
    completed_at?: string;
    required_documents?: string[];
  }): Promise<EscrowReleaseCondition> {
    // Mock implementation since table doesn't exist yet
    console.log('Updating mock release condition:', id, updates);
    return {
      id,
      escrow_account_id: 'mock-account',
      condition_type: 'mock',
      description: 'Mock condition',
      is_met: updates.is_met || false,
      required_documents: updates.required_documents || [],
      due_date: null,
      completed_at: updates.completed_at || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}

// --- Supabase-backed functions ---

// Create new escrow account
export async function createEscrowAccount({
  opportunityId,
  investorId,
  entrepreneurId,
  type,
  amount,
  currency,
  releaseConditions
}: {
  opportunityId: string;
  investorId: string;
  entrepreneurId: string;
  type: EscrowType;
  amount: number;
  currency: string;
  releaseConditions: string[];
}): Promise<EscrowAccount> {
  const accountNumber = `ESC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const { data, error } = await supabase
    .from('escrow_accounts')
    .insert({
      account_number: accountNumber,
      opportunity_id: opportunityId,
      investor_id: investorId,
      entrepreneur_id: entrepreneurId,
      type,
      status: 'pending' as EscrowStatus,
      total_amount: amount,
      available_balance: 0,
      held_amount: amount,
      currency,
      release_conditions: releaseConditions
    })
    .select()
    .single();

  if (error) throw error;
  return data as EscrowAccount;
}

// Get escrow account by ID
export async function getEscrowAccount(accountId: string): Promise<EscrowAccount | null> {
  const { data, error } = await supabase
    .from('escrow_accounts')
    .select('*')
    .eq('id', accountId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as EscrowAccount | null;
}

// Get escrow accounts by user (investor or entrepreneur)
export async function getEscrowAccountsByUser(userId: string, role: 'investor' | 'entrepreneur'): Promise<EscrowAccount[]> {
  const column = role === 'investor' ? 'investor_id' : 'entrepreneur_id';
  
  const { data, error } = await supabase
    .from('escrow_accounts')
    .select('*')
    .eq(column, userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as EscrowAccount[];
}

// Fund escrow account
export async function fundEscrowAccount(accountId: string, amount: number, reference: string): Promise<EscrowTransaction> {
  const account = await getEscrowAccount(accountId);
  if (!account) throw new Error('Escrow account not found');
  
  if (account.status !== 'pending') {
    throw new Error('Account is not in pending status');
  }

  const { data: transaction, error: txError } = await supabase
    .from('escrow_transactions')
    .insert({
      escrow_account_id: accountId,
      type: 'deposit' as TransactionType,
      amount,
      currency: account.currency,
      reference,
      description: `Initial funding for ${account.type} escrow`,
      status: 'completed',
      transaction_date: new Date().toISOString(),
      processed_at: new Date().toISOString()
    })
    .select()
    .single();

  if (txError) throw txError;

  const { error: updateError } = await supabase
    .from('escrow_accounts')
    .update({
      status: 'funded' as EscrowStatus,
      available_balance: amount,
      held_amount: 0,
      updated_at: new Date().toISOString()
    })
    .eq('id', accountId);

  if (updateError) throw updateError;

  return transaction as EscrowTransaction;
}

// Release funds from escrow
export async function releaseEscrowFunds(
  accountId: string, 
  amount: number, 
  recipientId: string,
  reason: string
): Promise<EscrowTransaction> {
  const account = await getEscrowAccount(accountId);
  if (!account) throw new Error('Escrow account not found');

  if (account.available_balance < amount) {
    throw new Error('Insufficient funds in escrow account');
  }

  const { data: transaction, error: txError } = await supabase
    .from('escrow_transactions')
    .insert({
      escrow_account_id: accountId,
      type: 'release' as TransactionType,
      amount,
      currency: account.currency,
      reference: `REL-${Date.now()}`,
      description: reason,
      status: 'completed',
      transaction_date: new Date().toISOString(),
      processed_at: new Date().toISOString(),
      metadata: { recipient_id: recipientId }
    })
    .select()
    .single();

  if (txError) throw txError;

  const newBalance = account.available_balance - amount;
  const { error: updateError } = await supabase
    .from('escrow_accounts')
    .update({
      available_balance: newBalance,
      status: newBalance === 0 ? 'released' as EscrowStatus : 'active' as EscrowStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', accountId);

  if (updateError) throw updateError;

  return transaction as EscrowTransaction;
}

// Get escrow transactions
export async function getEscrowTransactions(accountId: string): Promise<EscrowTransaction[]> {
  const { data, error } = await supabase
    .from('escrow_transactions')
    .select('*')
    .eq('escrow_account_id', accountId)
    .order('transaction_date', { ascending: false });

  if (error) throw error;
  return data as EscrowTransaction[];
}

// Mock implementation for release conditions since table doesn't exist
export async function addReleaseCondition(
  accountId: string,
  conditionType: string,
  description: string,
  dueDate?: string
): Promise<EscrowReleaseCondition> {
  console.log('Mock: Adding release condition', { accountId, conditionType, description, dueDate });
  return {
    id: `mock-${Date.now()}`,
    escrow_account_id: accountId,
    condition_type: conditionType,
    description,
    due_date: dueDate || null,
    is_met: false,
    required_documents: [],
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Mock implementation for marking condition as met
export async function markReleaseConditionMet(conditionId: string): Promise<void> {
  console.log('Mock: Marking release condition as met', conditionId);
}

// Mock implementation for getting release conditions
export async function getReleaseConditions(accountId: string): Promise<EscrowReleaseCondition[]> {
  console.log('Mock: Getting release conditions for', accountId);
  return [];
}

// Check if all release conditions are met (mock)
export async function checkReleaseConditions(accountId: string): Promise<boolean> {
  console.log('Mock: Checking release conditions for', accountId);
  return true; // Mock: always return true for now
}

// Auto-release funds if conditions are met
export async function autoReleaseIfConditionsMet(accountId: string): Promise<boolean> {
  const account = await getEscrowAccount(accountId);
  if (!account) return false;

  const conditionsMet = await checkReleaseConditions(accountId);
  if (!conditionsMet) return false;

  if (account.available_balance > 0) {
    await releaseEscrowFunds(
      accountId,
      account.available_balance,
      account.entrepreneur_id,
      'Automatic release - all conditions met'
    );
    return true;
  }

  return false;
}

// Dispute escrow account
export async function disputeEscrowAccount(accountId: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from('escrow_accounts')
    .update({
      status: 'disputed' as EscrowStatus,
      admin_notes: reason,
      updated_at: new Date().toISOString()
    })
    .eq('id', accountId);

  if (error) throw error;
}

// Cancel escrow account
export async function cancelEscrowAccount(accountId: string, reason: string): Promise<void> {
  const account = await getEscrowAccount(accountId);
  if (!account) throw new Error('Escrow account not found');

  if (account.available_balance > 0) {
    await releaseEscrowFunds(
      accountId,
      account.available_balance,
      account.investor_id,
      'Refund due to cancellation'
    );
  }

  const { error } = await supabase
    .from('escrow_accounts')
    .update({
      status: 'cancelled' as EscrowStatus,
      admin_notes: reason,
      updated_at: new Date().toISOString()
    })
    .eq('id', accountId);

  if (error) throw error;
}

// Get escrow statistics
export async function getEscrowStats(userId: string, role: 'investor' | 'entrepreneur'): Promise<any> {
  const accounts = await getEscrowAccountsByUser(userId, role);
  
  const stats = {
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter(a => a.status === 'active').length,
    fundedAccounts: accounts.filter(a => a.status === 'funded').length,
    totalAmount: accounts.reduce((sum, a) => sum + a.total_amount, 0),
    availableBalance: accounts.reduce((sum, a) => sum + a.available_balance, 0),
    heldAmount: accounts.reduce((sum, a) => sum + a.held_amount, 0),
    disputedAccounts: accounts.filter(a => a.status === 'disputed').length
  };

  return stats;
}

// Calculate escrow fees
export function calculateEscrowFee(amount: number, currency: string): number {
  const feePercentage = 0.01;
  const minFee = 10;
  const maxFee = 500;
  
  const calculatedFee = amount * feePercentage;
  return Math.min(Math.max(calculatedFee, minFee), maxFee);
}

// Validate escrow account for release
export async function validateEscrowRelease(accountId: string): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  const account = await getEscrowAccount(accountId);
  if (!account) {
    errors.push('Escrow account not found');
    return { valid: false, errors };
  }

  if (account.status !== 'funded' && account.status !== 'active') {
    errors.push('Account is not in funded or active status');
  }

  if (account.available_balance <= 0) {
    errors.push('No funds available for release');
  }

  const conditionsMet = await checkReleaseConditions(accountId);
  if (!conditionsMet) {
    errors.push('Not all release conditions have been met');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
