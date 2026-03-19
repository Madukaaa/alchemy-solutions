"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listBlogPosts, type BlogPost } from "@/lib/firestoreHelpers";

// Derive an image URL from possible shapes in Firestore documents.
function getImageUrl(post: BlogPost) {
  if (!post) return "";

  if (post.mainImage) {
    if (typeof post.mainImage === "string") return post.mainImage;
    if (post.mainImage.secure_url) return post.mainImage.secure_url;
    if (post.mainImage.url) return post.mainImage.url;
  }

  if (post.image) return post.image;
  if (post.imageUrl) return post.imageUrl;

  if (Array.isArray(post.sections)) {
    const sec = post.sections.find(
      (s) =>
        s.type === "image" &&
        typeof s.content === "object" &&
        s.content &&
        (s.content.url || s.content.secure_url)
    );
    if (sec && typeof sec.content === "object" && sec.content) {
      return sec.content.url || sec.content.secure_url || "";
    }
  }

  return "";
}

// Format date as "Mon DD, YYYY".
function formatDate(value?: string | number) {
  if (!value) return "";

  let d: Date;
  if (typeof value === "number") {
    d = new Date(value);
  } else {
    d = new Date(String(value));
    if (Number.isNaN(d.getTime())) return String(value);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export default function BlogPostList() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchPosts() {
      try {
        const posts = await listBlogPosts();
        if (!mounted) return;
        setBlogPosts(posts || []);
      } catch (err) {
        console.error("Error loading blog posts:", err);
        if (mounted) setBlogPosts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchPosts();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-white">Loading posts...</div>;
  }

  if (!blogPosts.length) {
    return <div className="py-20 text-center text-white">No blog posts found yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 px-4 pt-12 sm:px-6 md:grid-cols-2 md:gap-8 md:px-8">
      {blogPosts.map((post) => {
        const imageUrl = getImageUrl(post);

        return (
          <div key={post.id} className="flex flex-col">
            <Link
              href={`/blog/${post.id}`}
              className="mx-auto block w-full cursor-pointer overflow-hidden rounded-2xl shadow-md sm:w-4/5"
            >
              <div className="h-56 w-full overflow-hidden sm:h-64 md:h-80">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={post.title || "Blog image"}
                    className="h-full w-full rounded-2xl object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white/10 text-white/70">
                    No image
                  </div>
                )}
              </div>
            </Link>

            <div className="mx-auto mb-10 mt-4 w-full sm:mb-16 sm:w-4/5 md:mb-20">
              <h2 className="text-lg font-bold text-white sm:text-xl md:text-2xl">{post.title}</h2>
              <h3 className="mt-2 text-base font-light text-white sm:text-lg md:text-xl">{post.subtitle}</h3>
              <div className="mt-2 text-xs text-brand sm:text-sm">
                {formatDate(post.date || post.createdAt)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
