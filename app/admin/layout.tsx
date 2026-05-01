import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // ❌ НЕ АДМИН — НЕ ПУСКАЕМ
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  return <>{children}</>;
}