// Platform Settings Module
// Manages platform-wide configuration including support contacts and escrow accounts

export interface SupportContact {
  id: string;
  type: 'phone' | 'email' | 'whatsapp';
  value: string;
  label: string;
  is_active: boolean;
  priority: number;
}

export interface EscrowAccount {
  id: string;
  name: string;
  type: 'mobile_wallet' | 'bank_account' | 'platform_default';
  account_holder: string;
  account_number?: string;
  phone_number?: string;
  provider?: string; // Ecocash, Omari, Innbucks, etc.
  is_active: boolean;
  is_default: boolean;
  is_pool_specific: boolean;
  pool_id?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  approved_by?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface PlatformSettings {
  id: string;
  support_contacts: SupportContact[];
  default_escrow_accounts: EscrowAccount[];
  platform_name: string;
  platform_description: string;
  terms_of_service_url?: string;
  privacy_policy_url?: string;
  maintenance_mode: boolean;
  maintenance_message?: string;
  updated_at: string;
  updated_by: string;
}

// Default platform settings
export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  id: 'platform-settings',
  platform_name: 'Investment Portal',
  platform_description: 'Comprehensive investment ecosystem for entrepreneurs, investors, and service providers',
  support_contacts: [
    {
      id: 'phone-support',
      type: 'phone',
      value: '+263 78 998 9619',
      label: 'Phone Support',
      is_active: true,
      priority: 1
    },
    {
      id: 'email-support',
      type: 'email',
      value: 'admin@abathwa.com',
      label: 'Email Support',
      is_active: true,
      priority: 2
    },
    {
      id: 'whatsapp-support',
      type: 'whatsapp',
      value: 'wa.me/789989619',
      label: 'WhatsApp Support',
      is_active: true,
      priority: 3
    }
  ],
  default_escrow_accounts: [
    {
      id: 'mobile-wallets',
      name: 'Mobile Wallets (Ecocash, Omari, Innbucks)',
      type: 'mobile_wallet',
      account_holder: 'Vusa Ncube',
      phone_number: '0788420479',
      provider: 'Multiple',
      is_active: true,
      is_default: true,
      is_pool_specific: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'system',
      approval_status: 'approved',
      notes: 'Default mobile wallet escrow account for all transactions'
    },
    {
      id: 'innbucks-bank',
      name: 'Innbucks MicroBank',
      type: 'bank_account',
      account_holder: 'Abathwa Incubator PBC',
      account_number: '013113351190001',
      provider: 'Innbucks MicroBank',
      is_active: true,
      is_default: true,
      is_pool_specific: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'system',
      approval_status: 'approved',
      notes: 'Default bank account escrow for larger transactions'
    }
  ],
  maintenance_mode: false,
  updated_at: new Date().toISOString(),
  updated_by: 'system'
};

export class PlatformSettingsManager {
  private settings: PlatformSettings = DEFAULT_PLATFORM_SETTINGS;

  // Get all platform settings
  getSettings(): PlatformSettings {
    return this.settings;
  }

  // Get support contacts
  getSupportContacts(): SupportContact[] {
    return this.settings.support_contacts.filter(contact => contact.is_active);
  }

  // Get default escrow accounts
  getDefaultEscrowAccounts(): EscrowAccount[] {
    return this.settings.default_escrow_accounts.filter(account => account.is_active);
  }

  // Get escrow accounts for a specific pool
  getPoolEscrowAccounts(poolId: string): EscrowAccount[] {
    return this.settings.default_escrow_accounts.filter(account => 
      account.is_active && 
      (account.is_pool_specific ? account.pool_id === poolId : true)
    );
  }

  // Update support contacts
  updateSupportContacts(contacts: SupportContact[]): void {
    this.settings.support_contacts = contacts;
    this.settings.updated_at = new Date().toISOString();
    this.settings.updated_by = 'admin';
  }

  // Add new escrow account
  addEscrowAccount(account: Omit<EscrowAccount, 'id' | 'created_at' | 'updated_at'>): EscrowAccount {
    const newAccount: EscrowAccount = {
      ...account,
      id: `escrow-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.settings.default_escrow_accounts.push(newAccount);
    this.settings.updated_at = new Date().toISOString();
    this.settings.updated_by = 'admin';

    return newAccount;
  }

  // Update escrow account
  updateEscrowAccount(id: string, updates: Partial<EscrowAccount>): EscrowAccount | null {
    const accountIndex = this.settings.default_escrow_accounts.findIndex(acc => acc.id === id);
    if (accountIndex === -1) return null;

    this.settings.default_escrow_accounts[accountIndex] = {
      ...this.settings.default_escrow_accounts[accountIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.settings.updated_at = new Date().toISOString();
    this.settings.updated_by = 'admin';

    return this.settings.default_escrow_accounts[accountIndex];
  }

  // Approve escrow account
  approveEscrowAccount(id: string, approvedBy: string): EscrowAccount | null {
    return this.updateEscrowAccount(id, {
      approval_status: 'approved',
      approved_by: approvedBy
    });
  }

  // Reject escrow account
  rejectEscrowAccount(id: string, rejectedBy: string, reason?: string): EscrowAccount | null {
    return this.updateEscrowAccount(id, {
      approval_status: 'rejected',
      approved_by: rejectedBy,
      notes: reason ? `Rejected: ${reason}` : 'Rejected by admin'
    });
  }

  // Deactivate escrow account
  deactivateEscrowAccount(id: string): EscrowAccount | null {
    return this.updateEscrowAccount(id, { is_active: false });
  }

  // Get pending escrow approvals
  getPendingEscrowApprovals(): EscrowAccount[] {
    return this.settings.default_escrow_accounts.filter(account => 
      account.approval_status === 'pending'
    );
  }

  // Set maintenance mode
  setMaintenanceMode(enabled: boolean, message?: string): void {
    this.settings.maintenance_mode = enabled;
    this.settings.maintenance_message = message;
    this.settings.updated_at = new Date().toISOString();
    this.settings.updated_by = 'admin';
  }

  // Get contact by type
  getContactByType(type: 'phone' | 'email' | 'whatsapp'): SupportContact | null {
    return this.settings.support_contacts.find(contact => 
      contact.type === type && contact.is_active
    ) || null;
  }

  // Format contact for display
  formatContact(contact: SupportContact): string {
    switch (contact.type) {
      case 'phone':
        return contact.value;
      case 'email':
        return contact.value;
      case 'whatsapp':
        return `https://${contact.value}`;
      default:
        return contact.value;
    }
  }

  // Validate escrow account
  validateEscrowAccount(account: Partial<EscrowAccount>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!account.name?.trim()) {
      errors.push('Account name is required');
    }

    if (!account.account_holder?.trim()) {
      errors.push('Account holder is required');
    }

    if (account.type === 'bank_account' && !account.account_number?.trim()) {
      errors.push('Account number is required for bank accounts');
    }

    if (account.type === 'mobile_wallet' && !account.phone_number?.trim()) {
      errors.push('Phone number is required for mobile wallets');
    }

    if (account.is_pool_specific && !account.pool_id) {
      errors.push('Pool ID is required for pool-specific accounts');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get escrow account statistics
  getEscrowStats() {
    const accounts = this.settings.default_escrow_accounts;
    return {
      total: accounts.length,
      active: accounts.filter(acc => acc.is_active).length,
      pending_approval: accounts.filter(acc => acc.approval_status === 'pending').length,
      pool_specific: accounts.filter(acc => acc.is_pool_specific).length,
      mobile_wallets: accounts.filter(acc => acc.type === 'mobile_wallet').length,
      bank_accounts: accounts.filter(acc => acc.type === 'bank_account').length
    };
  }
}

// Export singleton instance
export const platformSettingsManager = new PlatformSettingsManager();

// Helper functions
export const getSupportContacts = () => platformSettingsManager.getSupportContacts();
export const getDefaultEscrowAccounts = () => platformSettingsManager.getDefaultEscrowAccounts();
export const getPoolEscrowAccounts = (poolId: string) => platformSettingsManager.getPoolEscrowAccounts(poolId);
export const getContactByType = (type: 'phone' | 'email' | 'whatsapp') => platformSettingsManager.getContactByType(type);
export const formatContact = (contact: SupportContact) => platformSettingsManager.formatContact(contact); 