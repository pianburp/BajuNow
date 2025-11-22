import { getUserProfile } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShirtIcon, ShoppingCartIcon, PackageIcon } from "lucide-react";
import Link from "next/link";

export default async function UserDashboard() {
  const profile = await getUserProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome to BajuNow!</h1>
        <p className="text-muted-foreground">
          Hi {profile.email}, browse our collection of premium shirts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/user">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <ShirtIcon className="w-10 h-10 mb-2" />
              <CardTitle>Browse Shirts</CardTitle>
              <CardDescription>
                Explore our latest collection
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/user/cart">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <ShoppingCartIcon className="w-10 h-10 mb-2" />
              <CardTitle>Shopping Cart</CardTitle>
              <CardDescription>
                View and manage your cart
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/user/orders">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <PackageIcon className="w-10 h-10 mb-2" />
              <CardTitle>My Orders</CardTitle>
              <CardDescription>
                Track your order history
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Featured Shirts</CardTitle>
          <CardDescription>Check out our popular items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="w-full h-48 bg-muted rounded-md mb-3 flex items-center justify-center">
                  <ShirtIcon className="w-16 h-16 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">Premium Shirt {i}</h3>
                <p className="text-sm text-muted-foreground mb-2">Classic design, premium quality</p>
                <p className="font-bold text-lg">${(29.99 + i * 10).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
