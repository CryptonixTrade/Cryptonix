import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import ClientHome from "./ClientHome";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // 💣 ЖЁСТКАЯ БЛОКИРОВКА
  if (!session) {
    redirect("/login");
  }

  return <ClientHome />;
}