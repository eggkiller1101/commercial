import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 跟 demo 静态站 UI.formatBytes 的换算逻辑一致：小于 1024KB 显示 KB，否则显示 MB。 */
export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) {
    return "";
  }

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(0)} KB`;
  }

  return `${(kb / 1024).toFixed(1)} MB`;
}
