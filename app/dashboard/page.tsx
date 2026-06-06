import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import Cryptonix from "./Cryptonix";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-orange-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-160px] right-[-120px] h-[360px] w-[360px] rounded-full bg-yellow-500/10 blur-3xl" />

      <div className="relative z-10">
        <Cryptonix />
      </div>
    </div>
  );
}
