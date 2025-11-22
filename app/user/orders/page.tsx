import { getUserProfile } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageIcon } from "lucide-react";

export default async function OrdersPage() {
  const profile = await getUserProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground">
          Track your order history and status
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>View all your past orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <PackageIcon className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No orders yet. Start shopping to place your first order!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
