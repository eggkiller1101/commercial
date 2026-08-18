"use client";

import { Archive } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type CaseStatusButtonProps = {
  caseId: string;
  status: string;
};

export function CaseStatusButton({ caseId, status }: CaseStatusButtonProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status !== "published") {
    return null;
  }

  async function handleArchive() {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/cases/${caseId}/status`, {
        body: JSON.stringify({
          status: "archived"
        }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "PATCH"
      });
      const result = (await response.json()) as {
        message?: string;
        ok?: boolean;
      };

      if (!response.ok || !result.ok) {
        setErrorMessage(result.message ?? "案例下架失败，请稍后重试");
        return;
      }

      router.refresh();
    } catch {
      setErrorMessage("案例下架失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        disabled={isSubmitting}
        onClick={handleArchive}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Archive className="mr-2 h-4 w-4" />
        {isSubmitting ? "下架中" : "下架"}
      </Button>
      {errorMessage ? (
        <span
          className="max-w-28 truncate text-xs text-destructive"
          title={errorMessage}
        >
          {errorMessage}
        </span>
      ) : null}
    </div>
  );
}
