"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  addBlogPost,
  deleteBlogPost,
  listBlogPosts,
  updateBlogPost,
  type BlogPost,
} from "@/lib/firestoreHelpers";
import { createUploadFormData, getCloudinaryUrl } from "@/lib/cloudinary";

type SectionType =
  | "heading"
  | "paragraph"
  | "bullet_list"
  | "numbered_list"
  | "image";

type ImageContent = {
  url: string;
  alt: string;
};

type BlogSection = {
  id: number;
  type: SectionType;
  content: string | ImageContent;
  items: string[];
};

type StoredImage = string | { secure_url?: string; url?: string } | null;

type DragState = {
  dragging: boolean;
  offsetX: number;
  offsetY: number;
};

type ToolbarPos = {
  top: number;
  left: number;
};

function renderInlineFormatting(text: string) {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v ?? ""));
}

function normalizeSection(raw: unknown, index: number): BlogSection {
  const fallbackId = Date.now() + index;
  if (!raw || typeof raw !== "object") {
    return {
      id: fallbackId,
      type: "paragraph",
      content: "",
      items: [],
    };
  }

  const section = raw as {
    id?: number;
    type?: string;
    content?: unknown;
    items?: unknown;
  };

  const validType: SectionType[] = [
    "heading",
    "paragraph",
    "bullet_list",
    "numbered_list",
    "image",
  ];
  const type = validType.includes(section.type as SectionType)
    ? (section.type as SectionType)
    : "paragraph";

  if (type === "image") {
    const contentObj = section.content as
      | { url?: string; secure_url?: string; alt?: string }
      | undefined;
    return {
      id: typeof section.id === "number" ? section.id : fallbackId,
      type,
      content: {
        url: contentObj?.url ?? contentObj?.secure_url ?? "",
        alt: contentObj?.alt ?? "",
      },
      items: [],
    };
  }

  return {
    id: typeof section.id === "number" ? section.id : fallbackId,
    type,
    content: typeof section.content === "string" ? section.content : "",
    items: asStringArray(section.items),
  };
}

function getImageUrl(image: StoredImage) {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.secure_url ?? image.url ?? "";
}

async function uploadToCloudinary(file: File, folder: string) {
  const formData = createUploadFormData(file, folder);
  const res = await fetch(getCloudinaryUrl(), {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Cloudinary upload failed.");
  }

  return (await res.json()) as { secure_url?: string; url?: string };
}

export default function BlogAdminPage() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [date, setDate] = useState("");
  const [author, setAuthor] = useState("");
  const [readTime, setReadTime] = useState("");
  const [mainImage, setMainImage] = useState<StoredImage>(null);
  const [sections, setSections] = useState<BlogSection[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [mainImageUploading, setMainImageUploading] = useState(false);
  const [uploadingSectionId, setUploadingSectionId] = useState<number | null>(
    null,
  );

  const dragRef = useRef<DragState>({
    dragging: false,
    offsetX: 0,
    offsetY: 0,
  });
  const [toolbarPos, setToolbarPos] = useState<ToolbarPos>(() => {
    if (typeof window === "undefined") {
      return { top: 80, left: 40 };
    }

    try {
      const raw = window.localStorage.getItem("blogAdminToolbarPos");
      return raw ? (JSON.parse(raw) as ToolbarPos) : { top: 80, left: 40 };
    } catch {
      return { top: 80, left: 40 };
    }
  });

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const all = await listBlogPosts();
      setPosts(all as BlogPost[]);
    } finally {
      setLoading(false);
    }
  }

  function addSection(type: SectionType) {
    const section: BlogSection = {
      id: Date.now(),
      type,
      content: type === "image" ? { url: "", alt: "" } : "",
      items: type === "bullet_list" || type === "numbered_list" ? [""] : [],
    };
    setSections((prev) => [...prev, section]);
  }

  function updateSection(id: number, patch: Partial<BlogSection>) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  }

  function removeSection(id: number) {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) {
      window.alert("Title required");
      return;
    }

    const payload = {
      title,
      subtitle,
      date: date || new Date().toISOString(),
      author,
      readTime,
      mainImage: mainImage || null,
      sections,
      createdAt: Date.now(),
    };

    try {
      if (editingId) {
        await updateBlogPost(editingId, payload);
      } else {
        await addBlogPost(payload);
      }
    } catch (err: unknown) {
      console.error("Failed to save post", err);
      window.alert(
        `Failed to save post: ${err instanceof Error ? err.message : String(err)}`,
      );
      return;
    }

    setTitle("");
    setSubtitle("");
    setDate("");
    setAuthor("");
    setReadTime("");
    setMainImage(null);
    setSections([]);
    setEditingId(null);
    await load();
    window.alert(editingId ? "Post updated" : "Post created");
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this post?")) return;
    try {
      await deleteBlogPost(id);
    } catch (err: unknown) {
      console.error("Failed to delete post", err);
      window.alert(
        `Failed to delete post: ${err instanceof Error ? err.message : String(err)}`,
      );
      return;
    }
    await load();
  }

  function startEdit(post: BlogPost) {
    setEditingId(post.id);
    setTitle(post.title ?? "");
    setSubtitle(post.subtitle ?? "");
    setDate(typeof post.date === "string" ? post.date : "");
    setAuthor(post.author ?? "");
    setReadTime(post.readTime ?? "");
    setMainImage((post.mainImage as StoredImage) ?? null);

    const rawSections = Array.isArray(post.sections)
      ? post.sections
      : Array.isArray(post.content)
        ? post.content
        : [];
    setSections(rawSections.map((s, i) => normalizeSection(s, i)));

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragRef.current.dragging) return;
      const x = e.clientX - dragRef.current.offsetX;
      const y = e.clientY - dragRef.current.offsetY;
      setToolbarPos({ left: Math.max(8, x), top: Math.max(8, y) });
    }

    function onMouseUp() {
      dragRef.current.dragging = false;
    }

    function onTouchMove(e: TouchEvent) {
      if (!dragRef.current.dragging || e.touches.length === 0) return;
      const t = e.touches[0];
      const x = t.clientX - dragRef.current.offsetX;
      const y = t.clientY - dragRef.current.offsetY;
      setToolbarPos({ left: Math.max(8, x), top: Math.max(8, y) });
      e.preventDefault();
    }

    function onTouchEnd() {
      dragRef.current.dragging = false;
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "blogAdminToolbarPos",
        JSON.stringify(toolbarPos),
      );
    } catch {
      // no-op
    }
  }, [toolbarPos]);

  function startDrag(
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) {
    const clientX = "touches" in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
    const clientY = "touches" in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;
    const rect = e.currentTarget.getBoundingClientRect();

    dragRef.current.dragging = true;
    dragRef.current.offsetX = clientX - rect.left;
    dragRef.current.offsetY = clientY - rect.top;
    e.preventDefault();
  }

  async function onMainImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setMainImageUploading(true);
    try {
      const uploaded = await uploadToCloudinary(file, "blog-main");
      setMainImage(uploaded);
    } catch (err: unknown) {
      console.error("Main image upload failed", err);
      window.alert(
        `Main image upload failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setMainImageUploading(false);
      e.target.value = "";
    }
  }

  async function onSectionImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
    sectionId: number,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSectionId(sectionId);
    try {
      const uploaded = await uploadToCloudinary(file, "blog-images");
      const url = uploaded.secure_url ?? uploaded.url ?? "";
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                content: {
                  url,
                  alt:
                    typeof s.content === "object" && s.content !== null
                      ? (s.content as ImageContent).alt
                      : "",
                },
              }
            : s,
        ),
      );
    } catch (err: unknown) {
      console.error("Section image upload failed", err);
      window.alert(
        `Section image upload failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setUploadingSectionId(null);
      e.target.value = "";
    }
  }

  const mainImageUrl = getImageUrl(mainImage);

  return (
    <div
      className="p-6 min-h-screen font-sans bg-gray-900 text-white"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="flex justify-between items-center mb-4">
        <Link
          href="/admin/admin-dashboard"
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm border border-gray-700"
        >
          Back to Dashboard
        </Link>
        <h2 className="text-3xl font-bold">Blog Admin</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <form
            onSubmit={handleCreate}
            className="space-y-4 bg-gray-800 p-4 rounded-lg ring-1 ring-gray-700"
          >
            <div className="grid grid-cols-1 gap-2">
              <input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="p-3 bg-gray-700 text-white rounded border border-gray-600"
              />
              <input
                placeholder="Subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="p-3 bg-gray-700 text-white rounded border border-gray-600"
              />
              <div className="flex gap-2 flex-wrap">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="p-3 bg-gray-700 text-white rounded border border-gray-600"
                />
                <input
                  placeholder="Author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="p-3 bg-gray-700 text-white rounded border border-gray-600"
                />
                <input
                  placeholder="Read time (e.g. 7 min)"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  className="p-3 bg-gray-700 text-white rounded border border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Main Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onMainImageChange}
                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                />
                {mainImageUploading && (
                  <div className="text-sm text-gray-400 mt-2">Uploading...</div>
                )}
                {mainImageUrl && (
                  <img
                    src={mainImageUrl}
                    alt="main"
                    className="mt-2 w-48 rounded"
                  />
                )}
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {sections.map((s) => (
                <div
                  key={s.id}
                  className="bg-gray-800 p-3 rounded-md ring-1 ring-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-200">{s.type}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => removeSection(s.id)}
                        type="button"
                        className="text-red-400 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {s.type === "heading" && (
                    <input
                      value={typeof s.content === "string" ? s.content : ""}
                      onChange={(e) =>
                        updateSection(s.id, { content: e.target.value })
                      }
                      placeholder="Heading text"
                      className="w-full p-2 bg-gray-700 text-white rounded"
                    />
                  )}

                  {s.type === "paragraph" && (
                    <textarea
                      value={typeof s.content === "string" ? s.content : ""}
                      onChange={(e) =>
                        updateSection(s.id, { content: e.target.value })
                      }
                      placeholder="Write paragraph (use **bold** for bold)"
                      className="w-full p-2 bg-gray-700 text-white rounded min-h-25"
                    />
                  )}

                  {(s.type === "bullet_list" || s.type === "numbered_list") && (
                    <div>
                      {s.items.map((it, idx) => (
                        <div key={idx} className="flex gap-2 items-center mb-2">
                          <input
                            value={it}
                            onChange={(e) => {
                              const items = [...s.items];
                              items[idx] = e.target.value;
                              updateSection(s.id, { items });
                            }}
                            placeholder={`Item ${idx + 1}`}
                            className="flex-1 p-2 bg-gray-700 text-white rounded"
                          />
                          <button
                            onClick={() => {
                              const items = s.items.filter((_, i) => i !== idx);
                              updateSection(s.id, { items });
                            }}
                            type="button"
                            className="text-red-400"
                          >
                            Del
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          updateSection(s.id, { items: [...s.items, ""] })
                        }
                        className="px-2 py-1 bg-gray-700 rounded"
                      >
                        Add Item
                      </button>
                    </div>
                  )}

                  {s.type === "image" && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onSectionImageChange(e, s.id)}
                        className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                      />
                      {uploadingSectionId === s.id && (
                        <div className="text-sm text-gray-400 mt-2">
                          Uploading...
                        </div>
                      )}
                      {typeof s.content === "object" && s.content?.url && (
                        <img
                          src={s.content.url}
                          alt={s.content.alt}
                          className="mt-2 w-48 rounded"
                        />
                      )}
                      <input
                        value={
                          typeof s.content === "object" ? s.content.alt : ""
                        }
                        onChange={(e) =>
                          updateSection(s.id, {
                            content: {
                              url:
                                typeof s.content === "object"
                                  ? s.content.url
                                  : "",
                              alt: e.target.value,
                            },
                          })
                        }
                        placeholder="Alt text"
                        className="w-full p-2 bg-gray-700 text-white rounded mt-2"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-[#E87A27] rounded-md text-white shadow-sm hover:shadow-md transition">
                {editingId ? "Save Changes" : "Create Post"}
              </button>
              <button
                type="button"
                onClick={() => setShowPreview((p) => !p)}
                className="px-4 py-2 bg-gray-700 rounded-md text-white border border-gray-600 hover:bg-gray-700/95 transition"
              >
                {showPreview ? "Hide" : "Preview"}
              </button>
            </div>
          </form>
        </div>

        <div>
          {showPreview && (
            <div className="bg-gray-800 text-white rounded p-4 ring-1 ring-gray-700">
              <h1 className="text-2xl font-bold mb-2">{title}</h1>
              {subtitle && (
                <h2 className="text-lg text-gray-300 mb-2">{subtitle}</h2>
              )}
              <div className="text-sm text-gray-400 mb-4">
                {date ? new Date(date).toLocaleDateString() : ""}
                {author ? ` • ${author}` : ""}
                {readTime ? ` • ${readTime}` : ""}
              </div>
              {mainImageUrl && (
                <img
                  src={mainImageUrl}
                  alt="main"
                  className="w-full rounded mb-4"
                />
              )}
              <div className="space-y-4">
                {sections.map((s) => (
                  <div key={s.id}>
                    {s.type === "heading" && (
                      <h3
                        className="text-xl font-semibold"
                        dangerouslySetInnerHTML={{
                          __html: renderInlineFormatting(
                            typeof s.content === "string" ? s.content : "",
                          ),
                        }}
                      />
                    )}
                    {s.type === "paragraph" && (
                      <p
                        className="text-base"
                        dangerouslySetInnerHTML={{
                          __html: renderInlineFormatting(
                            typeof s.content === "string" ? s.content : "",
                          ),
                        }}
                      />
                    )}
                    {s.type === "bullet_list" && (
                      <ul className="list-disc pl-6">
                        {s.items.map((it, i) => (
                          <li
                            key={`${s.id}-bullet-${i}`}
                            dangerouslySetInnerHTML={{
                              __html: renderInlineFormatting(it),
                            }}
                          />
                        ))}
                      </ul>
                    )}
                    {s.type === "numbered_list" && (
                      <ol className="list-decimal pl-6">
                        {s.items.map((it, i) => (
                          <li
                            key={`${s.id}-numbered-${i}`}
                            dangerouslySetInnerHTML={{
                              __html: renderInlineFormatting(it),
                            }}
                          />
                        ))}
                      </ol>
                    )}
                    {s.type === "image" &&
                      typeof s.content === "object" &&
                      s.content.url && (
                        <img
                          src={s.content.url}
                          alt={s.content.alt}
                          className="w-full rounded"
                        />
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 bg-gray-800 p-4 rounded ring-1 ring-gray-700">
            <h3 className="text-lg font-semibold mb-3">Existing Posts</h3>
            {loading && <div>Loading...</div>}
            <ul className="space-y-3">
              {posts.map((p) => (
                <li
                  key={p.id}
                  className="p-3 bg-gray-800 rounded flex justify-between items-center ring-1 ring-gray-700"
                >
                  <div>
                    <div className="font-semibold text-white">{p.title}</div>
                    <div className="text-sm text-gray-400">{p.subtitle}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {p.date
                        ? new Date(String(p.date)).toLocaleDateString()
                        : ""}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(p)}
                      className="px-2 py-1 border rounded text-yellow-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-2 py-1 border rounded text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div
        role="toolbar"
        aria-label="Sections toolbar"
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        style={{ top: toolbarPos.top, left: toolbarPos.left }}
        className="fixed z-50 p-3 bg-linear-to-br from-white/6 to-white/3 text-white rounded-lg shadow-2xl ring-1 ring-gray-700 backdrop-blur-md max-w-max"
      >
        <div className="flex gap-2 items-center">
          <div className="text-xs text-gray-300 mr-2 select-none">Drag</div>
          <button
            type="button"
            onClick={() => addSection("heading")}
            className="px-3 py-1 bg-white/6 hover:bg-white/10 text-sm rounded-md border border-gray-600"
          >
            Heading
          </button>
          <button
            type="button"
            onClick={() => addSection("paragraph")}
            className="px-3 py-1 bg-white/6 hover:bg-white/10 text-sm rounded-md border border-gray-600"
          >
            Paragraph
          </button>
          <button
            type="button"
            onClick={() => addSection("bullet_list")}
            className="px-3 py-1 bg-white/6 hover:bg-white/10 text-sm rounded-md border border-gray-600"
          >
            Bullet
          </button>
          <button
            type="button"
            onClick={() => addSection("numbered_list")}
            className="px-3 py-1 bg-white/6 hover:bg-white/10 text-sm rounded-md border border-gray-600"
          >
            Numbered
          </button>
          <button
            type="button"
            onClick={() => addSection("image")}
            className="px-3 py-1 bg-white/6 hover:bg-white/10 text-sm rounded-md border border-gray-600"
          >
            Image
          </button>
        </div>
      </div>
    </div>
  );
}
