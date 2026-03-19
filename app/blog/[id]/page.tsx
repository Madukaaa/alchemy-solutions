"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DotExpandButton from "@/components/ui/DotExpandButton";
import CircleButton from "@/components/ui/CircleButton";
import { listBlogPosts, type BlogPost } from "@/lib/firestoreHelpers";

type BlogSection = {
  type?: string;
  title?: string;
  text?: string;
  content?: string | { url?: string; secure_url?: string };
  url?: string;
  items?: string[];
};

function getImageUrl(post: BlogPost | null) {
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
        (s.content.url || s.content.secure_url),
    );
    if (sec && typeof sec.content === "object")
      return sec.content.url || sec.content.secure_url || "";
  }

  if (Array.isArray(post.content)) {
    const sec = post.content.find(
      (s) =>
        s.type === "image" &&
        (s.url ||
          (typeof s.content === "object" &&
            s.content &&
            (s.content.url || s.content.secure_url))),
    );
    if (sec) {
      if (sec.url) return sec.url;
      if (typeof sec.content === "object" && sec.content)
        return sec.content.url || sec.content.secure_url || "";
    }
  }

  return "";
}

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

function renderContent(sections: BlogSection[] | undefined) {
  if (!Array.isArray(sections)) return null;

  return sections.map((section, index) => {
    const rawType = section.type || "";
    const type =
      rawType === "bullet_list"
        ? "bulletList"
        : rawType === "numbered_list"
          ? "numberedList"
          : rawType;

    const text =
      section.text ||
      (typeof section.content === "string" ? section.content : "");
    const items = section.items || [];
    const imageUrl =
      section.url ||
      (typeof section.content === "object" && section.content
        ? section.content.url || section.content.secure_url
        : "");

    switch (type) {
      case "intro":
      case "paragraph":
        return (
          <div key={index} className="mb-6 sm:mb-8">
            <p className="text-base leading-relaxed text-gray-300 sm:text-lg text-justify">
              {String(text)
                .split("**")
                .map((t, i) =>
                  i % 2 === 1 ? (
                    <strong key={i} className="font-semibold text-white">
                      {t}
                    </strong>
                  ) : (
                    t
                  ),
                )}
            </p>
          </div>
        );

      case "heading":
        return (
          <h2
            key={index}
            className="mb-4 mt-8 text-center text-2xl font-medium text-white first:mt-0 sm:mb-6 sm:mt-12 sm:text-left sm:text-3xl"
          >
            {section.title || text}
          </h2>
        );

      case "secondaryHeading":
        return (
          <h3
            key={index}
            className="mb-3 mt-6 text-center text-lg font-medium text-white first:mt-0 sm:mb-4 sm:mt-8 sm:text-left sm:text-xl"
          >
            {section.title || text}
          </h3>
        );

      case "bulletList":
      case "bullet_list":
        return (
          <div key={index} className="mb-6 sm:mb-8">
            <ul className="space-y-2 sm:space-y-3">
              {(items || []).map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start">
                  <span className="mr-2 mt-1 text-brand sm:mr-3">•</span>
                  <span className="text-base leading-relaxed text-gray-300 sm:text-lg text-justify">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );

      case "numberedList":
      case "numbered_list":
        return (
          <div key={index} className="mb-6 sm:mb-8">
            <ol className="list-decimal pl-6">
              {(items || []).map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="text-base leading-relaxed text-gray-300 sm:text-lg text-justify"
                >
                  {item}
                </li>
              ))}
            </ol>
          </div>
        );

      case "image":
        return (
          <div key={index} className="my-8 flex justify-center sm:my-12">
            <div className="w-full max-w-4xl">
              <img
                src={imageUrl || ""}
                alt={section.title || "Blog content image"}
                className="h-48 w-full rounded-xl object-cover shadow-2xl sm:h-64 sm:rounded-2xl md:h-100 lg:h-125"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  });
}

export default function BlogPostDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const posts = await listBlogPosts();
        if (!mounted) return;

        setAllPosts(posts || []);
        const found = (posts || []).find((p) => String(p.id) === String(id));
        setPost(found || null);
      } catch (err) {
        console.error("Could not load posts from Firestore:", err);
        if (!mounted) return;
        setAllPosts([]);
        setPost(null);
      } finally {
        if (mounted) setLoading(false);
      }

      window.scrollTo(0, 0);
    }

    if (id) {
      load();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  const relatedPosts = useMemo(
    () =>
      allPosts
        .filter((related) => String(related.id) !== String(post?.id))
        .slice(0, 4),
    [allPosts, post?.id],
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center text-white">
          <h2 className="mb-4 text-2xl font-bold">Post Not Found</h2>
          <Link href="/blog" className="text-lg text-brand hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 text-white">
      <div className="relative">
        <div className="absolute left-4 top-4 z-20 sm:top-6">
          <Link
            href="/blog"
            aria-label="Back to blog"
            className="relative block h-20 w-20"
          >
            <CircleButton
              size="small"
              customPosition="left-0 top-0"
              arrowDirection="left"
              className="bg-black/50"
            />
          </Link>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-2 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          <div className="mb-8 text-center sm:mb-12 sm:text-left">
            <h1 className="mb-4 text-2xl font-semibold sm:mb-6 sm:text-3xl md:text-5xl">
              {post.title}
            </h1>
            <h2 className="mb-4 text-lg font-medium text-gray-300 sm:mb-6 sm:text-xl md:text-3xl">
              {post.subtitle}
            </h2>

            <div className="mb-3 flex flex-row flex-wrap items-center justify-center gap-2 text-sm sm:mb-4 sm:justify-start sm:gap-4 sm:text-base">
              <div className="font-medium text-brand">
                {formatDate(post.date || post.createdAt)}
              </div>
              <div className="text-gray-500">•</div>
              <div className="text-gray-300">
                By{" "}
                <span className="font-medium text-white">
                  {post.author || "Alchemy Team"}
                </span>
              </div>
              <div className="text-gray-500">•</div>
              <div className="text-gray-400">
                {post.readTime || "5 min read"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-black py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-black p-1 sm:rounded-[2rem] sm:p-2">
            <img
              src={getImageUrl(post)}
              alt={post.title || "Blog hero image"}
              className="mx-auto h-56 w-full rounded-xl object-cover sm:h-80 sm:rounded-[2rem] md:h-125 lg:h-175"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <article className="mx-auto max-w-6xl">
          <div className="space-y-6">
            {renderContent((post.content || post.sections) as BlogSection[])}
          </div>
        </article>
      </div>

      <section className="border-t border-gray-800 bg-black py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-2xl font-bold text-white sm:mb-16 sm:text-3xl md:text-4xl">
            Similar Blog Posts
          </h2>

          <div className="grid grid-cols-1 gap-8 sm:gap-12 md:grid-cols-2">
            {relatedPosts.map((relatedPost) => (
              <div
                key={relatedPost.id}
                className="mx-auto flex w-full flex-col sm:w-4/5"
              >
                <Link
                  href={`/blog/${relatedPost.id}`}
                  className="block cursor-pointer overflow-hidden rounded-xl shadow-xl sm:rounded-3xl"
                >
                  <div className="h-60 w-full overflow-hidden sm:h-72 md:h-96">
                    <img
                      src={getImageUrl(relatedPost)}
                      alt={relatedPost.title || "Related blog image"}
                      className="h-full w-full rounded-xl object-cover transition-transform duration-300 hover:scale-105 sm:rounded-3xl"
                    />
                  </div>
                </Link>

                <div className="mx-auto mt-4 w-full text-center sm:mt-6 sm:w-4/5 sm:text-left">
                  <h2 className="mb-2 text-xl font-bold text-white sm:mb-3 sm:text-2xl md:text-3xl">
                    {relatedPost.title}
                  </h2>
                  <h3 className="mb-2 text-base font-light text-white sm:mb-3 sm:text-lg md:text-xl">
                    {relatedPost.subtitle}
                  </h3>
                  <div className="text-sm font-medium text-brand sm:text-base md:text-lg">
                    {formatDate(relatedPost.date || relatedPost.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center sm:mt-16">
            <Link href="/blog" className="inline-block">
              <DotExpandButton text="Read all blogs" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
