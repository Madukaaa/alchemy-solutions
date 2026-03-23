"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  addGalleryItem,
  deleteGalleryItem,
  listGallery,
} from "@/lib/firestoreHelpers";
import { createUploadFormData, getCloudinaryUrl } from "@/lib/cloudinary";

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  asset_id?: string;
  original_filename?: string;
};

type GalleryItem = {
  id: string;
  imageUrl?: string;
  url?: string;
  title?: string;
  label?: string;
};

function resolveGalleryImageUrl(item: GalleryItem) {
  if (typeof item.imageUrl === "string" && item.imageUrl.trim()) {
    return item.imageUrl;
  }

  if (typeof item.url === "string" && item.url.trim()) {
    return item.url;
  }

  return "";
}

export default function GalleryAdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white min-h-screen bg-gray-900">Loading...</div>}>
      <GalleryAdminContent />
    </Suspense>
  );
}

function GalleryAdminContent() {
  const [uploaded, setUploaded] = useState<CloudinaryUploadResponse[]>([]);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const backLink = from === "mod" ? "/admin/mod-dashboard" : "/admin/admin-dashboard";

  async function load() {
    setLoading(true);
    try {
      const all = await listGallery();
      setItems((Array.isArray(all) ? all : []) as GalleryItem[]);
    } catch (err) {
      console.error("Failed to load gallery", err);
      window.alert("Failed to load gallery images.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const responses = await Promise.all(
        files.map(async (file) => {
          const formData = createUploadFormData(file, "gallery");
          const res = await fetch(getCloudinaryUrl(), {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const text = await res.text();
            throw new Error(text || "Cloudinary upload failed");
          }

          return (await res.json()) as CloudinaryUploadResponse;
        }),
      );

      setUploaded((prev) => [...prev, ...responses]);
    } catch (err) {
      console.error("Upload failed", err);
      window.alert(
        `Upload failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (uploaded.length === 0) {
      window.alert("Upload at least one image first.");
      return;
    }

    setSaving(true);
    try {
      await Promise.all(
        uploaded.map((u) => {
          const imageUrl = (u.secure_url ?? "").trim();
          if (!imageUrl) {
            return Promise.resolve();
          }

          return addGalleryItem({
            imageUrl,
            title: u.original_filename || u.public_id || "Gallery image",
          });
        }),
      );

      setUploaded([]);
      await load();
    } catch (err) {
      console.error("Failed to add gallery items", err);
      window.alert("Failed to add one or more images to gallery.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this image?")) return;

    try {
      await deleteGalleryItem(id);
      await load();
    } catch (err) {
      console.error("Failed to delete gallery item", err);
      window.alert("Failed to delete image.");
    }
  }

  async function handleDeleteAll() {
    if (items.length === 0) {
      window.alert("No images to delete.");
      return;
    }

    if (!window.confirm("Delete ALL gallery images? This cannot be undone.")) {
      return;
    }

    try {
      await Promise.all(items.map((it) => deleteGalleryItem(it.id)));
      await load();
    } catch (err) {
      console.error("Failed to delete all gallery items", err);
      window.alert("Failed to delete all images. See console for details.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gallery Management</h1>
            <p className="text-sm text-gray-300">
              Upload images and publish them to the website gallery.
            </p>
          </div>

          <Link
            href={backLink}
            className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>

        <form
          onSubmit={handleAdd}
          className="mb-6 rounded-lg border border-gray-700 bg-gray-800 p-4"
        >
          <label className="mb-2 block text-sm font-medium text-gray-200">
            Upload images
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="block w-full rounded border border-gray-700 bg-gray-900 p-2 text-sm"
          />

          {uploading && (
            <p className="mt-2 text-sm text-gray-300">Uploading images...</p>
          )}

          {uploaded.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {uploaded.map((u, i) => (
                <div
                  key={u.public_id || u.asset_id || `uploaded-${i}`}
                  className="rounded bg-gray-900 p-1"
                >
                  <img
                    src={u.secure_url}
                    alt={u.public_id || `uploaded-${i}`}
                    className="h-24 w-full rounded object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={saving || uploaded.length === 0}
              className="rounded bg-brand px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add to Gallery"}
            </button>

            {uploaded.length > 0 && (
              <button
                type="button"
                onClick={() => setUploaded([])}
                className="rounded border border-gray-700 px-3 py-2"
              >
                Clear Queue
              </button>
            )}
          </div>
        </form>

        <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Images</h2>

            <button
              onClick={handleDeleteAll}
              className="rounded bg-red-600 px-3 py-1 text-sm text-white"
            >
              Delete all
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-gray-300">Loading images...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-300">No gallery images found.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((it) => {
                const imageUrl = resolveGalleryImageUrl(it);
                const title = it.title || it.label || "Untitled";

                return (
                  <li
                    key={it.id}
                    className="rounded border border-gray-700 bg-gray-900 p-2"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={title}
                        className="mb-2 h-40 w-full rounded object-cover"
                      />
                    ) : (
                      <div className="mb-2 flex h-40 w-full items-center justify-center rounded bg-gray-800 text-sm text-gray-400">
                        No image URL
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm text-gray-200">
                        {title}
                      </div>
                      <button
                        onClick={() => handleDelete(it.id)}
                        className="rounded border border-gray-700 px-2 py-1 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
