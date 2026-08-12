"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST"
      });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <Button
      disabled={isSubmitting}
      onClick={handleLogout}
      size="sm"
      type="button"
      variant="ghost"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isSubmitting ? "退出中" : "退出登录"}
    </Button>
  );
}
