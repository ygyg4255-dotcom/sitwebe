/** BLOG POST DETAIL (admin) — edit form for one article. */
import { notFound } from "next/navigation";
import { getStaffBlogPostById } from "@/lib/queries/admin";
import { BlogPostForm } from "@/components/admin/forms/BlogPostForm";
import { AdminPageHeader } from "@/components/admin/AdminBits";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const post = await getStaffBlogPostById(id);
  return { title: post ? post.title_fr : "Article introuvable" };
}

export default async function AdminBlogDetailPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getStaffBlogPostById(id);

  if (!post) notFound();

  return (
    <div>
      <AdminPageHeader
        title={post.title_fr}
        description={post.is_published ? "Article publié." : "Brouillon — invisible sur le site."}
      />
      <BlogPostForm post={post} />
    </div>
  );
}