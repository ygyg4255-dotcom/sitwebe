/**
 * SITE SETTINGS ADMIN — the white-label identity of the client agency:
 * name, colors (they drive the CSS variables of every public page),
 * contact details and social links. A single row (id = 1).
 */
import Link from "next/link";
import { getStaffSettings } from "@/lib/queries/admin";
import { SettingsForm } from "@/components/admin/forms/SettingsForm";
import { AdminEmptyState, AdminPageHeader } from "@/components/admin/AdminBits";

export const metadata = { title: "Paramètres" };

export default async function AdminSettingsPage() {
  const settings = await getStaffSettings();

  return (
    <div>
      <AdminPageHeader
        title="Paramètres du site"
        description="Identité de l'agence appliquée à tout le site public."
      />

      {settings ? (
        <SettingsForm settings={settings} />
      ) : (
        <AdminEmptyState
          title="Paramètres introuvables."
          hint="La ligne site_settings (id = 1) est absente de la base — exécutez les migrations (supabase/db push) puis rechargez cette page."
        />
      )}

      <p className="mt-4 text-sm text-muted">
        Besoin de gérer les comptes staff ? Consultez la documentation dans le README —{" "}
        <Link href="/admin" className="text-secondary underline">
          retour au tableau de bord
        </Link>
        .
      </p>
    </div>
  );
}