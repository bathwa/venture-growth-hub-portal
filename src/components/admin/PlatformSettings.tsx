import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  PlatformSettingsManager, 
  SupportContact, 
  EscrowAccount,
  platformSettingsManager 
} from "@/lib/platform-settings";
import { Phone, Mail, MessageCircle, Plus, Edit, Trash2, Shield, Banknote, Smartphone } from "lucide-react";

export function PlatformSettings() {
  const [settings, setSettings] = useState(platformSettingsManager.getSettings());
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingEscrow, setIsEditingEscrow] = useState(false);
  const [editingContact, setEditingContact] = useState<SupportContact | null>(null);
  const [editingEscrow, setEditingEscrow] = useState<EscrowAccount | null>(null);
  const [newContact, setNewContact] = useState<Partial<SupportContact>>({
    type: 'phone',
    value: '',
    label: '',
    is_active: true,
    priority: 1
  });
  const [newEscrow, setNewEscrow] = useState<Partial<EscrowAccount>>({
    name: '',
    type: 'mobile_wallet',
    account_holder: '',
    is_active: true,
    is_default: false,
    is_pool_specific: false,
    approval_status: 'pending'
  });

  const handleUpdateSupportContacts = () => {
    if (editingContact) {
      // Update existing contact
      const updatedContacts = settings.support_contacts.map(contact =>
        contact.id === editingContact.id ? editingContact : contact
      );
      platformSettingsManager.updateSupportContacts(updatedContacts);
      setSettings(platformSettingsManager.getSettings());
      setIsEditingContact(false);
      setEditingContact(null);
      toast.success("Support contact updated successfully");
    } else {
      // Add new contact
      const contact: SupportContact = {
        id: `contact-${Date.now()}`,
        type: newContact.type as 'phone' | 'email' | 'whatsapp',
        value: newContact.value || '',
        label: newContact.label || '',
        is_active: newContact.is_active || true,
        priority: newContact.priority || 1
      };
      
      const updatedContacts = [...settings.support_contacts, contact];
      platformSettingsManager.updateSupportContacts(updatedContacts);
      setSettings(platformSettingsManager.getSettings());
      setNewContact({ type: 'phone', value: '', label: '', is_active: true, priority: 1 });
      toast.success("Support contact added successfully");
    }
  };

  const handleUpdateEscrowAccount = () => {
    if (editingEscrow) {
      // Update existing escrow
      platformSettingsManager.updateEscrowAccount(editingEscrow.id, editingEscrow);
      setSettings(platformSettingsManager.getSettings());
      setIsEditingEscrow(false);
      setEditingEscrow(null);
      toast.success("Escrow account updated successfully");
    } else {
      // Add new escrow
      const escrow: Omit<EscrowAccount, 'id' | 'created_at' | 'updated_at'> = {
        name: newEscrow.name || '',
        type: newEscrow.type as 'mobile_wallet' | 'bank_account' | 'platform_default',
        account_holder: newEscrow.account_holder || '',
        account_number: newEscrow.account_number,
        phone_number: newEscrow.phone_number,
        provider: newEscrow.provider,
        is_active: newEscrow.is_active || true,
        is_default: newEscrow.is_default || false,
        is_pool_specific: newEscrow.is_pool_specific || false,
        pool_id: newEscrow.pool_id,
        created_by: 'admin',
        approval_status: 'pending'
      };
      
      platformSettingsManager.addEscrowAccount(escrow);
      setSettings(platformSettingsManager.getSettings());
      setNewEscrow({
        name: '',
        type: 'mobile_wallet',
        account_holder: '',
        is_active: true,
        is_default: false,
        is_pool_specific: false,
        approval_status: 'pending'
      });
      toast.success("Escrow account added successfully");
    }
  };

  const handleApproveEscrow = (id: string) => {
    platformSettingsManager.approveEscrowAccount(id, 'admin');
    setSettings(platformSettingsManager.getSettings());
    toast.success("Escrow account approved");
  };

  const handleRejectEscrow = (id: string) => {
    platformSettingsManager.rejectEscrowAccount(id, 'admin', 'Rejected by admin');
    setSettings(platformSettingsManager.getSettings());
    toast.success("Escrow account rejected");
  };

  const handleDeleteContact = (id: string) => {
    const updatedContacts = settings.support_contacts.filter(contact => contact.id !== id);
    platformSettingsManager.updateSupportContacts(updatedContacts);
    setSettings(platformSettingsManager.getSettings());
    toast.success("Support contact deleted");
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'whatsapp': return <MessageCircle className="h-4 w-4" />;
      default: return <Phone className="h-4 w-4" />;
    }
  };

  const getEscrowIcon = (type: string) => {
    switch (type) {
      case 'mobile_wallet': return <Smartphone className="h-4 w-4" />;
      case 'bank_account': return <Banknote className="h-4 w-4" />;
      case 'platform_default': return <Shield className="h-4 w-4" />;
      default: return <Banknote className="h-4 w-4" />;
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Platform Settings</h2>
      
      {/* Support Contacts */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Support Contacts</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => { setIsEditingContact(false); setEditingContact(null); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingContact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
                  <DialogDescription>
                    {editingContact ? 'Update support contact information' : 'Add a new support contact'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Contact Type</Label>
                    <Select 
                      value={editingContact?.type || newContact.type} 
                      onValueChange={(value) => {
                        if (editingContact) {
                          setEditingContact({ ...editingContact, type: value as any });
                        } else {
                          setNewContact({ ...newContact, type: value as any });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Label</Label>
                    <Input 
                      value={editingContact?.label || newContact.label || ''}
                      onChange={(e) => {
                        if (editingContact) {
                          setEditingContact({ ...editingContact, label: e.target.value });
                        } else {
                          setNewContact({ ...newContact, label: e.target.value });
                        }
                      }}
                      placeholder="e.g., Phone Support"
                    />
                  </div>
                  <div>
                    <Label>Value</Label>
                    <Input 
                      value={editingContact?.value || newContact.value || ''}
                      onChange={(e) => {
                        if (editingContact) {
                          setEditingContact({ ...editingContact, value: e.target.value });
                        } else {
                          setNewContact({ ...newContact, value: e.target.value });
                        }
                      }}
                      placeholder="e.g., +263 78 998 9619"
                    />
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Input 
                      type="number"
                      value={editingContact?.priority || newContact.priority || 1}
                      onChange={(e) => {
                        if (editingContact) {
                          setEditingContact({ ...editingContact, priority: parseInt(e.target.value) });
                        } else {
                          setNewContact({ ...newContact, priority: parseInt(e.target.value) });
                        }
                      }}
                      min="1"
                      max="10"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={editingContact?.is_active ?? newContact.is_active ?? true}
                      onCheckedChange={(checked) => {
                        if (editingContact) {
                          setEditingContact({ ...editingContact, is_active: checked });
                        } else {
                          setNewContact({ ...newContact, is_active: checked });
                        }
                      }}
                    />
                    <Label>Active</Label>
                  </div>
                  <Button onClick={handleUpdateSupportContacts} className="w-full">
                    {editingContact ? 'Update Contact' : 'Add Contact'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.support_contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getContactIcon(contact.type)}
                  <div>
                    <p className="font-medium">{contact.label}</p>
                    <p className="text-sm text-gray-600">{contact.value}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={contact.is_active ? "default" : "secondary"}>
                    {contact.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">Priority: {contact.priority}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingContact(contact);
                      setIsEditingContact(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteContact(contact.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Escrow Accounts */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Escrow Accounts</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => { setIsEditingEscrow(false); setEditingEscrow(null); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Escrow Account
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingEscrow ? 'Edit Escrow Account' : 'Add New Escrow Account'}</DialogTitle>
                  <DialogDescription>
                    {editingEscrow ? 'Update escrow account information' : 'Add a new escrow account'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Account Name</Label>
                    <Input 
                      value={editingEscrow?.name || newEscrow.name || ''}
                      onChange={(e) => {
                        if (editingEscrow) {
                          setEditingEscrow({ ...editingEscrow, name: e.target.value });
                        } else {
                          setNewEscrow({ ...newEscrow, name: e.target.value });
                        }
                      }}
                      placeholder="e.g., Mobile Wallets (Ecocash, Omari, Innbucks)"
                    />
                  </div>
                  <div>
                    <Label>Account Type</Label>
                    <Select 
                      value={editingEscrow?.type || newEscrow.type} 
                      onValueChange={(value) => {
                        if (editingEscrow) {
                          setEditingEscrow({ ...editingEscrow, type: value as any });
                        } else {
                          setNewEscrow({ ...newEscrow, type: value as any });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mobile_wallet">Mobile Wallet</SelectItem>
                        <SelectItem value="bank_account">Bank Account</SelectItem>
                        <SelectItem value="platform_default">Platform Default</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Account Holder</Label>
                    <Input 
                      value={editingEscrow?.account_holder || newEscrow.account_holder || ''}
                      onChange={(e) => {
                        if (editingEscrow) {
                          setEditingEscrow({ ...editingEscrow, account_holder: e.target.value });
                        } else {
                          setNewEscrow({ ...newEscrow, account_holder: e.target.value });
                        }
                      }}
                      placeholder="e.g., Vusa Ncube"
                    />
                  </div>
                  {(editingEscrow?.type === 'bank_account' || newEscrow.type === 'bank_account') && (
                    <div>
                      <Label>Account Number</Label>
                      <Input 
                        value={editingEscrow?.account_number || newEscrow.account_number || ''}
                        onChange={(e) => {
                          if (editingEscrow) {
                            setEditingEscrow({ ...editingEscrow, account_number: e.target.value });
                          } else {
                            setNewEscrow({ ...newEscrow, account_number: e.target.value });
                          }
                        }}
                        placeholder="e.g., 013113351190001"
                      />
                    </div>
                  )}
                  {(editingEscrow?.type === 'mobile_wallet' || newEscrow.type === 'mobile_wallet') && (
                    <div>
                      <Label>Phone Number</Label>
                      <Input 
                        value={editingEscrow?.phone_number || newEscrow.phone_number || ''}
                        onChange={(e) => {
                          if (editingEscrow) {
                            setEditingEscrow({ ...editingEscrow, phone_number: e.target.value });
                          } else {
                            setNewEscrow({ ...newEscrow, phone_number: e.target.value });
                          }
                        }}
                        placeholder="e.g., 0788420479"
                      />
                    </div>
                  )}
                  <div>
                    <Label>Provider</Label>
                    <Input 
                      value={editingEscrow?.provider || newEscrow.provider || ''}
                      onChange={(e) => {
                        if (editingEscrow) {
                          setEditingEscrow({ ...editingEscrow, provider: e.target.value });
                        } else {
                          setNewEscrow({ ...newEscrow, provider: e.target.value });
                        }
                      }}
                      placeholder="e.g., Ecocash, Innbucks MicroBank"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={editingEscrow?.is_active ?? newEscrow.is_active ?? true}
                      onCheckedChange={(checked) => {
                        if (editingEscrow) {
                          setEditingEscrow({ ...editingEscrow, is_active: checked });
                        } else {
                          setNewEscrow({ ...newEscrow, is_active: checked });
                        }
                      }}
                    />
                    <Label>Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={editingEscrow?.is_default ?? newEscrow.is_default ?? false}
                      onCheckedChange={(checked) => {
                        if (editingEscrow) {
                          setEditingEscrow({ ...editingEscrow, is_default: checked });
                        } else {
                          setNewEscrow({ ...newEscrow, is_default: checked });
                        }
                      }}
                    />
                    <Label>Default Account</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={editingEscrow?.is_pool_specific ?? newEscrow.is_pool_specific ?? false}
                      onCheckedChange={(checked) => {
                        if (editingEscrow) {
                          setEditingEscrow({ ...editingEscrow, is_pool_specific: checked });
                        } else {
                          setNewEscrow({ ...newEscrow, is_pool_specific: checked });
                        }
                      }}
                    />
                    <Label>Pool Specific</Label>
                  </div>
                  <Button onClick={handleUpdateEscrowAccount} className="w-full">
                    {editingEscrow ? 'Update Account' : 'Add Account'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.default_escrow_accounts.map((account) => (
              <div key={account.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getEscrowIcon(account.type)}
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-sm text-gray-600">
                        {account.account_holder}
                        {account.account_number && ` • ${account.account_number}`}
                        {account.phone_number && ` • ${account.phone_number}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={account.is_active ? "default" : "secondary"}>
                      {account.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {account.is_default && <Badge variant="outline">Default</Badge>}
                    <Badge className={getApprovalStatusColor(account.approval_status)}>
                      {account.approval_status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingEscrow(account);
                      setIsEditingEscrow(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  {account.approval_status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApproveEscrow(account.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectEscrow(account.id)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{settings.support_contacts.length}</p>
              <p className="text-sm text-gray-600">Support Contacts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{settings.default_escrow_accounts.length}</p>
              <p className="text-sm text-gray-600">Escrow Accounts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {settings.default_escrow_accounts.filter(acc => acc.approval_status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pending Approvals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {settings.default_escrow_accounts.filter(acc => acc.is_active).length}
              </p>
              <p className="text-sm text-gray-600">Active Accounts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
