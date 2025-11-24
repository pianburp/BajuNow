import { requireAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShirtIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

export default async function ProductsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/user");
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Product Management</h1>
          <p className="text-muted-foreground">
            Manage your shirt inventory and pricing
          </p>
        </div>
        <Link href="/admin/products/add">
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>Manage your shirt collection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="w-full h-48 bg-muted rounded-md mb-3 flex items-center justify-center">
                  <ShirtIcon className="w-16 h-16 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">Premium Shirt {i}</h3>
                <p className="text-sm text-muted-foreground mb-2">SKU: SHIRT-00{i}</p>
                <div className="flex justify-between items-center mb-3">
                  <p className="font-bold text-lg">${(29.99 + i * 10).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{50 - i * 5} in stock</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/products/${i}/edit`}>
                    <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                  </Link>
                  <Button variant="destructive" size="sm" className="flex-1">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
