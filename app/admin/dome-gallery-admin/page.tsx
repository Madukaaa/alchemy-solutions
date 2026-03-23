"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  addDomeImage,
  listDomeImages,
  deleteDomeImage,
} from "@/lib/firestoreHelpers";
import { uploadToCloudinary } from "@/lib/cloudinary";

type UploadedItem = { secure_url: string; url?: string; public_id?: string; asset_id?: string };
type GalleryItem = { id: string; imageUrl?: string; title?: string };

export default function DomeGalleryAdmin() {
  const [uploaded, setUploaded] = useState<UploadedItem[]>([]);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const all = await listDomeImages();
    setItems(all as GalleryItem[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setIsUploading(true);
    setLastError(null);
    try {
      const results = await Promise.all(
        files.map((f) => uploadToCloudinary(f, "dome-gallery"))
      );
      setUploaded((prev) => [
        ...prev,
        ...(results as UploadedItem[]),
      ]);
    } catch (err: any) {
      console.error("Upload failed", err);
      setLastError("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!uploaded || uploaded.length === 0) {
      alert("Upload at least one image first");
      return;
    }
    if (items.length + uploaded.length > 30) {
      alert("Cannot add: would exceed 30 images in DM Gallery");
      return;
    }
    setLastError(null);
    try {
      await Promise.all(
        uploaded.map((u) =>
          addDomeImage({ imageUrl: u.secure_url || u.url || "" })
        )
      );
      setUploaded([]);
      await load();
    } catch (err: any) {
      console.error("Failed to add dome images", err);
      setLastError(err?.message ?? String(err));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this image?")) return;
    await deleteDomeImage(id);
    load();
  }

  async function handleDeleteAll() {
    if (!items || items.length === 0) {
      alert("No images to delete");
      return;
    }
    if (!confirm("Delete ALL DM gallery images? This cannot be undone.")) return;
    try {
      await Promise.all(items.map((it) => deleteDomeImage(it.id)));
      load();
    } catch (err) {
      console.error("Failed to delete all dome images", err);
      alert("Failed to delete all images. See console for details.");
    }
  }

  return (
    <div className="p-8 min-h-screen bg-gray-900 text-white">
      <div className="mb-6">
        <Link
          href="/admin/admin-dashboard"
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm border border-gray-700"
        >
          Back to Dashboard
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-4">Digital Marketing Gallery Management</h2>

      {lastError && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-300 text-sm">
          {lastError}
        </div>
      )}

      <form onSubmit={handleAdd} className="mb-6 max-w-lg">
        <label className="block text-sm font-medium mb-2">Upload Images</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600 mb-3"
        />
        {isUploading && (
          <div className="text-sm text-gray-400 mb-3">Uploading...</div>
        )}
        {uploaded.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2 mb-3">
            {uploaded.map((u, i) => (
              <div
                key={u.public_id || u.asset_id || i}
                className="p-1 bg-gray-800 rounded"
              >
                <img
                  src={u.secure_url}
                  alt={u.public_id || `uploaded-${i}`}
                  className="w-full h-20 object-cover rounded"
                />
              </div>
            ))}
          </div>
        )}
        <button
          type="submit"
          disabled={isUploading || uploaded.length === 0}
          className="bg-brand text-white px-3 py-2 rounded disabled:opacity-50"
        >
          Add to DM Gallery
        </button>
      </form>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold">
            Images
            <span className="text-sm text-gray-300 ml-3">
              ({items?.length ?? 0}/30)
            </span>
          </h3>
          <button
            onClick={handleDeleteAll}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
          >
            Delete all
          </button>
        </div>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((it) => (
            <li
              key={it.id}
              className="bg-gray-800 text-white p-2 rounded ring-1 ring-gray-700"
            >
              <img
                src={it.imageUrl}
                alt={it.title ?? ""}
                className="w-full h-40 object-cover mb-2 rounded"
              />
              <div className="flex justify-between items-center">
                <div className="text-sm truncate">{it.title}</div>
                <button
                  onClick={() => handleDelete(it.id)}
                  className="px-2 py-1 border border-gray-700 rounded text-sm hover:bg-gray-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
        {items.length === 0 && !isUploading && (
          <div className="p-8 text-center text-gray-400">
            No images yet. Upload some to display in the DM Gallery.
          </div>
        )}
      </div>
    </div>
  );
}
