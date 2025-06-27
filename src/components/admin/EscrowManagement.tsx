
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EscrowManagement() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Escrow Management</h2>
      <Card>
        <CardHeader>
          <CardTitle>Escrow Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Escrow account management will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
