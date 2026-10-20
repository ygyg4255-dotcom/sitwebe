/**
 * BLOG ADMIN — list with publish toggles and delete, plus links to the
 * edit page.
 */
import Link from "next/link";
import { getStaffBlogPosts } from "@/lib/queries/admin";
import { deleteBlogPost, setBlogPostPublished } from "@/lib/actions/blog";
import { DeleteForm, TogglePublished } from "@/components/admin/Controls";
import { AdminEmptyState, AdminPageHeader, formatDateFr } from "@/components/admin/AdminBits";

export const metadata = { title: "Blog" };

export default async function AdminBlogPage() {
  const posts = await getStaffBlogPosts();

  return (
    <div>
      <AdminPageHeader
        title="Blog"
        description={`${posts.length} article(s) — brouillons compris.`}
        action={
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            + Nouvel article
          </Link>
        }
      />

      {posts.length === 0 ? (
        <AdminEmptyState
          title="Aucun article pour le moment."
          hint="Le blog aide le référencement de l'agence — commencez avec un guide de destination."
        />
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className="rounded-2xl border border-brand-border bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="truncate font-medium text-ink hover:text-primary"
                    >
                      {post.title_fr}
                    </Link>
                    {!post.is_published ? (
                      <span className="rounded-full bg-muted/15 px-2 py-0.5 text-xs font-medium text-muted">
                        Brouillon
                      </span>
                    ) : (
                      <span className="text-xs text-muted">
                        publié le {post.published_at ? formatDateFr(post.published_at) : "—"}
                      </span>
                    )}
                  </div>
                  {post.excerpt_fr ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{post.excerpt_fr}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted">{post.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <TogglePublished
                    id={post.id}
                    isPublished={post.is_published}
                    action={setBlogPostPublished}
                    labels={{ publish: "Publier", unpublish: "Dépublier" }}
                  />
                  <DeleteForm
                    id={post.id}
                    action={deleteBlogPost}
                    label="Supprimer"
                    confirmText="Supprimer cet article ?"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}