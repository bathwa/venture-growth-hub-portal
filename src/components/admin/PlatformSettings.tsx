
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { validateCurrency } from "@/lib/drbe";

interface PlatformSettings {
  default_currency: string;
  platform_fee: number;
  notification_email: string;
  auto_approve_small_payments: boolean;
  small_payment_threshold: number;
  maintenance_mode: boolean;
  max_file_size_mb: number;
}

interface PaymentGateway {
  id: string;
  name: string;
  is_active: boolean;
  config: {
    api_key?: string;
    webhook_url?: string;
  };
}

export function PlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettings>({
    default_currency: 'USD',
    platform_fee: 2.5,
    notification_email: 'admin@investmentportal.com',
    auto_approve_small_payments: false,
    small_payment_threshold: 1000,
    maintenance_mode: false,
    max_file_size_mb: 10
  });

  const [gateways, setGateways] = useState<PaymentGateway[]>([
    {
      id: '1',
      name: 'Stripe',
      is_active: false,
      config: {}
    },
    {
      id: '2',
      name: 'PayPal',
      is_active: false,
      config: {}
    },
    {
      id: '3',
      name: 'Flutterwave',
      is_active: false,
      config: {}
    }
  ]);

  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);

  const handleSettingsUpdate = () => {
    // Validate currency
    if (!validateCurrency(settings.default_currency)) {
      toast.error("Invalid currency code");
      return;
    }

    // Validate fee
    if (settings.platform_fee < 0 || settings.platform_fee > 10) {
      toast.error("Platform fee must be between 0% and 10%");
      return;
    }

    toast.success("Platform settings updated successfully");
  };

  const handleGatewayToggle = (gatewayId: string) => {
    setGateways(gateways.map(g => 
      g.id === gatewayId 
        ? { ...g, is_active: !g.is_active }
        : g
    ));
    toast.success("Payment gateway status updated");
  };

  const supportedCurrencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'ZWL', name: 'Zimbabwean Dollar' },
    { code: 'ZAR', name: 'South African Rand' },
    { code: 'KES', name: 'Kenyan Shilling' },
    { code: 'NGN', name: 'Nigerian Naira' },
    { code: 'GHS', name: 'Ghanaian Cedi' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Platform Settings</h2>
      
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="default_currency">Default Currency</Label>
              <select
                id="default_currency"
                value={settings.default_currency}
                onChange={(e) => setSettings({...settings, default_currency: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                {supportedCurrencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="platform_fee">Platform Fee (%)</Label>
              <Input
                id="platform_fee"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={settings.platform_fee}
                onChange={(e) => setSettings({...settings, platform_fee: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notification_email">Notification Email</Label>
            <Input
              id="notification_email"
              type="email"
              value={settings.notification_email}
              onChange={(e) => setSettings({...settings, notification_email: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="max_file_size">Max File Size (MB)</Label>
            <Input
              id="max_file_size"
              type="number"
              min="1"
              max="100"
              value={settings.max_file_size_mb}
              onChange={(e) => setSettings({...settings, max_file_size_mb: parseInt(e.target.value)})}
            />
          </div>

          <Button onClick={handleSettingsUpdate} className="w-full md:w-auto">
            Update General Settings
          </Button>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-approve Small Payments</Label>
              <p className="text-sm text-gray-600">Automatically approve payments below threshold</p>
            </div>
            <Switch
              checked={settings.auto_approve_small_payments}
              onCheckedChange={(checked) => setSettings({...settings, auto_approve_small_payments: checked})}
            />
          </div>

          {settings.auto_approve_small_payments && (
            <div>
              <Label htmlFor="payment_threshold">Small Payment Threshold ({settings.default_currency})</Label>
              <Input
                id="payment_threshold"
                type="number"
                min="0"
                value={settings.small_payment_threshold}
                onChange={(e) => setSettings({...settings, small_payment_threshold: parseInt(e.target.value)})}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Gateways */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateway Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gateways.map((gateway) => (
              <div key={gateway.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{gateway.name}</h4>
                  <p className="text-sm text-gray-600">
                    Status: {gateway.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedGateway(gateway)}
                  >
                    Configure
                  </Button>
                  <Switch
                    checked={gateway.is_active}
                    onCheckedChange={() => handleGatewayToggle(gateway.id)}
                  />
                </div>
              </div>
            ))}
          </div>

          {selectedGateway && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-3">Configure {selectedGateway.name}</h4>
              <div className="space-y-3">
                <div>
                  <Label>API Key</Label>
                  <Input placeholder="Enter API key" type="password" />
                </div>
                <div>
                  <Label>Webhook URL</Label>
                  <Input placeholder="Enter webhook URL" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => toast.success("Gateway configured successfully")}>
                    Save Configuration
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedGateway(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-gray-600">Temporarily disable user access for maintenance</p>
            </div>
            <Switch
              checked={settings.maintenance_mode}
              onCheckedChange={(checked) => setSettings({...settings, maintenance_mode: checked})}
            />
          </div>

          {settings.maintenance_mode && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ Maintenance mode is enabled. Users will see a maintenance message.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
