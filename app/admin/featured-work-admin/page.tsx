"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  addFeaturedWork,
  listFeaturedWork,
  updateFeaturedWork,
  deleteFeaturedWork,
} from "@/lib/firestoreHelpers";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function FeaturedWorkAdmin() {
  const [role, setRole] = useState("loading");
  const [featuredItems, setFeaturedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tag: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthed = window.localStorage.getItem("alchemy_admin_auth") === "true";
      const userRole = window.localStorage.getItem("alchemy_admin_role");
      if (isAuthed && userRole === "admin") {
        setRole("admin");
        loadFeaturedWork();
      } else {
        setRole("denied");
      }
    }
  }, []);

  async function loadFeaturedWork() {
    try {
      setLoading(true);
      const items = await listFeaturedWork();
      setFeaturedItems(items);
    } catch (err: any) {
      console.error("Error loading featured work:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadToCloudinary(file, "featured-work");
      setFormData((prev) => ({
        ...prev,
        imageUrl: uploaded.secure_url || uploaded.url || "",
      }));
    } catch (err: any) {
      console.error("Image upload failed", err);
      setError("Image upload failed: " + err.message);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.description ||
      !formData.tag ||
      !formData.imageUrl
    ) {
      setError("Please fill all fields and upload an image");
      return;
    }

    try {
      if (editingItem) {
        await updateFeaturedWork(editingItem.id, {
          title: formData.title,
          description: formData.description,
          tag: formData.tag,
          imageUrl: formData.imageUrl,
        });
      } else {
        await addFeaturedWork({
          title: formData.title,
          description: formData.description,
          tag: formData.tag,
          imageUrl: formData.imageUrl,
        });
      }

      // Reset form and refresh list
      setFormData({ title: "", description: "", tag: "", imageUrl: "" });
      setShowAddForm(false);
      setEditingItem(null);
      setError(null);
      await loadFeaturedWork();
    } catch (err: any) {
      console.error("Error saving featured work:", err);
      setError(err.message);
    }
  }

  async function handleDelete(id: string) {
    if (
      !window.confirm(
        "Are you sure you want to delete this featured work item?"
      )
    ) {
      return;
    }

    try {
      await deleteFeaturedWork(id);
      await loadFeaturedWork();
    } catch (err: any) {
      console.error("Error deleting featured work:", err);
      setError(err.message);
    }
  }

  function startEdit(item: any) {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      tag: item.tag,
      imageUrl: item.imageUrl,
    });
    setShowAddForm(true);
  }

  function cancelEdit() {
    setEditingItem(null);
    setFormData({ title: "", description: "", tag: "", imageUrl: "" });
    setShowAddForm(false);
    setError(null);
  }

  if (role === "loading") {
    return <div className="p-8 min-h-screen bg-gray-900 text-white">Loading...</div>;
  }

  if (role !== "admin") {
    return (
      <div className="p-8 min-h-screen bg-gray-900 text-white">
        <h2 className="text-2xl font-bold mb-4 text-red-400">Access Denied</h2>
        <p>Only admins can manage featured work.</p>
      </div>
    );
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

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Work Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-brand hover:bg-orange-600 text-white rounded"
        >
          {showAddForm ? "Cancel" : "Add New Featured Work"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">
            {editingItem ? "Edit Featured Work" : "Add New Featured Work"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="Enter project title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="Enter project description"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tag</label>
              <input
                type="text"
                name="tag"
                value={formData.tag}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="e.g., Web Development, Event & Media"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Project Image
              </label>
              {formData.imageUrl && (
                <div className="mb-4">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-48 h-32 object-cover rounded border border-gray-600"
                  />
                  <p className="text-sm text-gray-400 mt-1">Current image</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600"
              />
              {isUploading && (
                <div className="text-sm text-gray-400 mt-2">Uploading...</div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-brand hover:bg-orange-600 text-white rounded"
              >
                {editingItem ? "Update" : "Add"} Featured Work
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Featured Work List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold">Current Featured Work</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : featuredItems.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No featured work items yet. Add some to display on the homepage.
          </div>
        ) : (
          <div className="p-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-700 rounded-lg overflow-hidden"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-semibold mb-2">{item.title}</h4>
                    <p className="text-gray-300 text-sm mb-2">
                      {item.description}
                    </p>
                    <span className="inline-block px-2 py-1 bg-brand text-xs rounded mb-3">
                      {item.tag}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
