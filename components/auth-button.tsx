import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { Badge } from "./ui/badge";

export async function AuthButton() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button asChild size="sm" variant={"outline"}>
          <Link href="/auth/login">Sign in</Link>
        </Button>
        <Button asChild size="sm" variant={"default"}>
          <Link href="/auth/sign-up">Shop Now</Link>
        </Button>
      </div>
    );
  }

  // Get user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.sub)
    .single();

  const userRole = profile?.role || "user";

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-end gap-1">
        <span className="text-sm">{user.email}</span>
        <Badge variant={userRole === "admin" ? "destructive" : "secondary"} className="text-xs">
          {userRole === "admin" ? "Admin" : "User"}
        </Badge>
      </div>
      <LogoutButton />
    </div>
  );
}
