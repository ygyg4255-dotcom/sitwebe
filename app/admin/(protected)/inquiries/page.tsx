/**
 * INQUIRIES ADMIN — the contact-form inbox: mark read/unread, and for
 * admins only, delete. The public RLS policy lets anyone INSERT an
 * inquiry but only staff can SELECT them, so this page is the only
 * place these messages exist.
 */
import { getCurrentProfile } from "@/lib/auth";
import { getStaffInquiries } from "@/lib/queries/admin";
import { deleteInquiry } from "@/lib/actions/inquiries";
import { DeleteForm, MarkReadButton } from "@/components/admin/Controls";
import {
  AdminEmptyState,
  AdminPageHeader,
  formatDateTimeFr,
} from "@/components/admin/AdminBits";

export const metadata = { title: "Messages" };

export default async function AdminInquiriesPage() {
  const [inquiries, profile] = await Promise.all([
    getStaffInquiries(),
    getCurrentProfile(),
  ]);
  const isAdmin = profile?.role === "admin";
  const unread = inquiries.filter((inquiry) => !inquiry.is_read).length;

  return (
    <div>
      <AdminPageHeader
        title="Messages"
        description={`${inquiries.length} message(s) · ${unread} non lu(s).`}
      />

      {inquiries.length === 0 ? (
        <AdminEmptyState
          title="Aucun message pour le moment."
          hint="Les demandes envoyées depuis la page Contact apparaîtront ici."
        />
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => (
            <article
              key={inquiry.id}
              className={`rounded-2xl border bg-surface p-4 sm:p-5 ${
                inquiry.is_read ? "border-brand-border" : "border-primary/50"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium text-ink">{inquiry.name}</h2>
                    {!inquiry.is_read ? (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
                        Non lu
                      </span>
                    ) : null}
                  </div>
                  {inquiry.subject ? (
                    <p className="mt-1 text-sm font-medium text-ink">{inquiry.subject}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted">
                    {formatDateTimeFr(inquiry.created_at)} · {inquiry.email}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <MarkReadButton inquiryId={inquiry.id} isRead={inquiry.is_read} />
                  {isAdmin ? (
                    <DeleteForm
                      id={inquiry.id}
                      action={deleteInquiry}
                      label="Supprimer"
                      confirmText="Supprimer définitivement ce message ?"
                    />
                  ) : null}
                </div>
              </div>

              <p className="mt-3 whitespace-pre-line rounded-xl bg-sand px-3 py-2 text-sm text-ink">
                {inquiry.message}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}