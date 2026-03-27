import Link from "next/link";
import { AdminLoginForm } from "./components/AdminLoginForm";
import { AdminLogoutButton } from "./components/AdminLogoutButton";
import { verifyAdminSessionFromCookies } from "@/services/admin/admin-session";

export const dynamic = "force-dynamic";

interface AdminHomeProps {
  params: { adminSecret: string };
}

export default async function AdminSecretHomePage({ params }: AdminHomeProps) {
  const ok = await verifyAdminSessionFromCookies();
  const { adminSecret } = params;

  if (!ok) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-12">
        <AdminLoginForm />
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-text">Painel</h1>
      <p className="mt-2 text-sm text-text/70">Gestão interna (URL não divulgada).</p>
      <ul className="mt-6 space-y-2">
        <li>
          <Link
            href={`/${adminSecret}/codes`}
            className="font-medium text-primary hover:underline"
          >
            Códigos digitais — importar planilha e listagem
          </Link>
        </li>
      </ul>
      <AdminLogoutButton />
    </div>
  );
}
