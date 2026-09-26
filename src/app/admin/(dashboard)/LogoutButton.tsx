"use client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };
  return (
    <button onClick={logout} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-muted transition hover:bg-soft hover:text-fg">
      <LogOut className="size-3.5" aria-hidden />
      Sign out
    </button>
  );
}
