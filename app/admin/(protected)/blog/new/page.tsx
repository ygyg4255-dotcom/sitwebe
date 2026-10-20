/** NEW BLOG POST — creation form (redirects to the list on success). */
import { BlogPostForm } from "@/components/admin/forms/BlogPostForm";
import { AdminPageHeader } from "@/components/admin/AdminBits";

export const metadata = { title: "Nouvel article" };

export default function NewBlogPostPage() {
  return (
    <div>
      <AdminPageHeader
        title="Nouvel article"
        description="La date de publication est enregistrée automatiquement à la première publication."
      />
      <BlogPostForm />
    </div>
  );
}