import { requirePagePermission } from "@/features/auth/guards";

export default async function ProductsLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requirePagePermission("manage_content");

  return children;
}
