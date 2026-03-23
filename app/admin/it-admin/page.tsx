"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  addITProject, 
  listITProjects, 
  updateITProject, 
  deleteITProject 
} from '@/lib/firestoreHelpers';
import { uploadToCloudinary } from '@/lib/cloudinary';

export default function ItAdmin() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tag: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthed = window.localStorage.getItem("alchemy_admin_auth") === "true";
      const role = window.localStorage.getItem("alchemy_admin_role");
      
      if (!isAuthed || role !== 'admin') {
        router.replace("/admin/admin-dashboard");
        return;
      }

      setIsAdmin(true);
      loadProjects();
    }
  }, [router]);

  async function loadProjects() {
    try {
      setLoading(true);
      const projectList = await listITProjects();
      setProjects(projectList);
    } catch (err: any) {
      console.error('Error loading IT projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUploaded(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await uploadToCloudinary(file, "it-projects");
      const url = uploaded.secure_url ?? uploaded.url ?? "";
      setFormData(prev => ({
        ...prev,
        imageUrl: url
      }));
    } catch (err: any) {
      console.error("Image upload failed", err);
      setError("Image upload failed: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.tag || !formData.imageUrl) {
      setError('Please fill all fields and upload an image');
      return;
    }

    try {
      if (editingProject) {
        await updateITProject(editingProject.id, {
          title: formData.title,
          description: formData.description,
          tag: formData.tag,
          imageUrl: formData.imageUrl
        });
      } else {
        await addITProject({
          title: formData.title,
          description: formData.description,
          tag: formData.tag,
          imageUrl: formData.imageUrl
        });
      }
      
      // Reset form and refresh list
      setFormData({ title: '', description: '', tag: '', imageUrl: '' });
      setShowAddForm(false);
      setEditingProject(null);
      setError(null);
      await loadProjects();
    } catch (err: any) {
      console.error('Error saving IT project:', err);
      setError(err.message);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this IT project?')) {
      return;
    }

    try {
      await deleteITProject(id);
      await loadProjects();
    } catch (err: any) {
      console.error('Error deleting IT project:', err);
      setError(err.message);
    }
  }

  function startEdit(project: any) {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      tag: project.tag,
      imageUrl: project.imageUrl
    });
    setShowAddForm(true);
  }

  function cancelEdit() {
    setEditingProject(null);
    setFormData({ title: '', description: '', tag: '', imageUrl: '' });
    setShowAddForm(false);
    setError(null);
  }

  if (!isAdmin) {
    return (
      <div className="p-8 min-h-screen bg-gray-900 text-white">
        <h2 className="text-2xl font-bold mb-4 text-red-400">Loading...</h2>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gray-900 text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
      <Link
        href="/admin/admin-dashboard"
        className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm border border-gray-700 mb-6 inline-block"
      >
        Back to Dashboard
      </Link>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">IT Projects Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-[#E87A27] hover:bg-orange-600 text-white rounded"
        >
          {showAddForm ? 'Cancel' : 'Add New IT Project'}
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
            {editingProject ? 'Edit IT Project' : 'Add New IT Project'}
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
              <label className="block text-sm font-medium mb-2">Description</label>
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
                placeholder="e.g., Web Development, Mobile App"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Project Image</label>
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
                onChange={handleImageUploaded}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600"
              />
              {uploading && (
                <div className="text-sm text-gray-400 mt-2">Uploading image...</div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-[#E87A27] hover:bg-orange-600 text-white rounded"
                disabled={uploading}
              >
                {editingProject ? 'Update' : 'Add'} IT Project
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

      {/* IT Projects List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold">Current IT Projects</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No IT projects yet. Add some to display on the website.
          </div>
        ) : (
          <div className="p-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div key={project.id} className="bg-gray-700 rounded-lg overflow-hidden flex flex-col">
                  <img 
                    src={project.imageUrl} 
                    alt={project.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4 flex flex-col flex-grow">
                    <h4 className="font-semibold mb-2">{project.title}</h4>
                    <p className="text-gray-300 text-sm mb-2 flex-grow">{project.description}</p>
                    <span className="inline-block px-2 py-1 bg-[#E87A27] text-xs rounded mb-3 w-max">
                      {project.tag}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(project)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
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
