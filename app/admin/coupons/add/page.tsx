import { requireAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import CouponForm from "../coupon-form";

export default async function AddCouponPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/user");
  }

  return <CouponForm />;
}
