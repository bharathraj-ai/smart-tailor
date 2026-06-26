import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function TailorLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'admin' && session.user.role !== 'tailor')) {
    redirect('/');
  }

  return <>{children}</>;
}
