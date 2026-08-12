import { requirePagePermission } from "@/features/auth/guards";

export default async function InquiriesLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requirePagePermission("manage_inquiries");

  return children;
}
