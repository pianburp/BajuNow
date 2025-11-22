import { requireAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminOrdersPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/user");
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Order Management</h1>
        <p className="text-muted-foreground">
          View and manage customer orders
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>Manage order status and fulfillment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: 1001, customer: "john@example.com", items: 2, total: 79.98, status: "pending" },
              { id: 1002, customer: "jane@example.com", items: 1, total: 39.99, status: "processing" },
              { id: 1003, customer: "bob@example.com", items: 3, total: 119.97, status: "shipped" },
              { id: 1004, customer: "alice@example.com", items: 1, total: 49.99, status: "delivered" },
            ].map((order) => (
              <div key={order.id} className="flex items-center justify-between border p-4 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.customer}</p>
                  <p className="text-sm text-muted-foreground">{order.items} item(s)</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold">${order.total.toFixed(2)}</p>
                    <Badge variant={
                      order.status === "delivered" ? "default" :
                      order.status === "shipped" ? "secondary" :
                      order.status === "processing" ? "outline" : "destructive"
                    }>
                      {order.status}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
