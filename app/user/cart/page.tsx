import { getUserProfile } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCartIcon } from "lucide-react";

export default async function CartPage() {
  const profile = await getUserProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground">
          Review your selected items
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Cart</CardTitle>
          <CardDescription>Items ready for checkout</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingCartIcon className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Your cart is empty. Start shopping to add items!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
