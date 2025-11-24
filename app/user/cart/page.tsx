import { getUserProfile } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { CartManagement } from "@/components/cart-management";

export default async function CartPage() {
  const profile = await getUserProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  // Mock cart data - in real app this would come from database/state
  const cartItems = [
    {
      id: 1,
      name: "Premium Cotton T-Shirt",
      price: 29.99,
      size: "M",
      color: "Navy",
      quantity: 2,
      image: "/placeholder-shirt.jpg"
    },
    {
      id: 2,
      name: "Casual Polo Shirt",
      price: 39.99,
      size: "L",
      color: "White",
      quantity: 1,
      image: "/placeholder-shirt.jpg"
    },
    {
      id: 3,
      name: "Graphic Tee",
      price: 24.99,
      size: "S",
      color: "Black",
      quantity: 3,
      image: "/placeholder-shirt.jpg"
    }
  ];

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground">
          Review your selected items and proceed to checkout
        </p>
      </div>

      <CartManagement initialItems={cartItems} />
    </div>
  );
}
