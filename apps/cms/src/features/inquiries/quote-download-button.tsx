"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

type QuoteDownloadButtonProps = {
  filename: string;
  href: string;
};

export function QuoteDownloadButton({
  filename,
  href
}: QuoteDownloadButtonProps) {
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setError("");
    setIsDownloading(true);

    try {
      const response = await fetch(href);

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = filename;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("询价单下载失败，请稍后重试");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        disabled={isDownloading}
        onClick={handleDownload}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Download className="mr-2 h-4 w-4" />
        {isDownloading ? "下载中" : "下载"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
