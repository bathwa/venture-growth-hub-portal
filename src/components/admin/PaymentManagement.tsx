
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PaymentManagement() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Payment Management</h2>
      <Card>
        <CardHeader>
          <CardTitle>Payment Approval Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Payment management functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
