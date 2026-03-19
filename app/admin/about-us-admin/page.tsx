"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  addTeamMember,
  deleteTeamMember,
  listTeamMembers,
  updateTeamMember,
} from "@/lib/firestoreHelpers";
import { createUploadFormData, getCloudinaryUrl } from "@/lib/cloudinary";

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  asset_id?: string;
  original_filename?: string;
};

type TeamMember = {
  id: string;
  name?: string;
  role?: string;
  img?: string;
  imageUrl?: string;
  createdAt?: number;
  position?: number;
};

function resolveMemberImage(member: TeamMember) {
  if (typeof member.img === "string" && member.img.trim()) {
    return member.img;
  }

  if (typeof member.imageUrl === "string" && member.imageUrl.trim()) {
    return member.imageUrl;
  }

  return "";
}

export default function AboutUsAdminPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [uploaded, setUploaded] = useState<CloudinaryUploadResponse | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");

  async function load() {
    setLoading(true);
    try {
      const list = await listTeamMembers();
      setMembers((Array.isArray(list) ? list : []) as TeamMember[]);
    } catch (err) {
      console.error("Failed to load team members", err);
      window.alert("Failed to load team members.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = createUploadFormData(file, "team");
      const res = await fetch(getCloudinaryUrl(), {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Cloudinary upload failed");
      }

      const json = (await res.json()) as CloudinaryUploadResponse;
      setUploaded(json);
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

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const role = String(formData.get("role") ?? "").trim();

    if (!uploaded?.secure_url) {
      window.alert("Upload an image first.");
      return;
    }

    if (!name) {
      window.alert("Please provide a name.");
      return;
    }

    setSaving(true);
    try {
      await addTeamMember({
        name,
        role,
        img: uploaded.secure_url,
      });

      setUploaded(null);
      form.reset();
      await load();
    } catch (err) {
      console.error("Failed to add team member", err);
      window.alert("Failed to add team member.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(member: TeamMember) {
    setEditingId(member.id);
    setEditName(member.name ?? "");
    setEditRole(member.role ?? "");
  }

  async function handleSave(id: string) {
    const name = editName.trim();
    const role = editRole.trim();

    if (!name) {
      window.alert("Please provide a name.");
      return;
    }

    try {
      await updateTeamMember(id, { name, role });
      setEditingId(null);
      await load();
    } catch (err) {
      console.error("Failed to update team member", err);
      window.alert("Failed to update team member.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this team member?")) return;

    try {
      await deleteTeamMember(id);
      await load();
    } catch (err) {
      console.error("Failed to delete team member", err);
      window.alert("Failed to delete team member.");
    }
  }

  async function swapPositions(idxA: number, idxB: number) {
    if (
      idxA < 0 ||
      idxB < 0 ||
      idxA >= members.length ||
      idxB >= members.length
    ) {
      return;
    }

    const previous = [...members];
    const a = members[idxA];
    const b = members[idxB];

    const optimistic = [...members];
    [optimistic[idxA], optimistic[idxB]] = [optimistic[idxB], optimistic[idxA]];
    setMembers(optimistic);

    try {
      const aPos = a.position ?? a.createdAt ?? Date.now();
      const bPos = b.position ?? b.createdAt ?? Date.now();
      await updateTeamMember(a.id, { position: bPos });
      await updateTeamMember(b.id, { position: aPos });
      await load();
    } catch (err) {
      console.error("Failed to swap positions", err);
      setMembers(previous);
      window.alert("Failed to update order. Check console for details.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">About Us / Team Management</h1>
          <Link
            href="/admin/admin-dashboard"
            className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>

        <section className="mb-8 max-w-2xl rounded-lg border border-gray-700 bg-gray-800 p-4">
          <h2 className="mb-3 text-lg font-semibold">Add Team Member</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3">
            <input
              name="name"
              placeholder="Full name"
              className="rounded border border-gray-700 bg-gray-900 p-2"
            />
            <input
              name="role"
              placeholder="Role / title"
              className="rounded border border-gray-700 bg-gray-900 p-2"
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="block w-full rounded border border-gray-700 bg-gray-900 p-2 text-sm"
            />

            {uploading && (
              <p className="text-sm text-gray-300">Uploading image...</p>
            )}

            {uploaded?.secure_url && (
              <div className="flex items-center gap-3">
                <img
                  src={uploaded.secure_url}
                  alt="preview"
                  className="h-20 w-20 rounded object-cover"
                />
                <div className="text-sm text-gray-300">
                  Uploaded: {uploaded.original_filename || uploaded.public_id}
                </div>
              </div>
            )}

            <div>
              <button
                disabled={saving}
                className="rounded bg-[#E87A27] px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Adding..." : "Add Member"}
              </button>
            </div>
          </form>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Current Team</h2>
          {loading ? (
            <p className="text-sm text-gray-300">Loading team members...</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-gray-300">No team members found.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {members.map((member, index) => {
                const image = resolveMemberImage(member);
                const isEditing = editingId === member.id;

                return (
                  <li
                    key={member.id}
                    className="flex items-start gap-4 rounded bg-gray-800 p-4 ring-1 ring-gray-700"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={member.name || "team member"}
                        className="h-24 w-24 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded bg-gray-700 text-xs text-gray-300">
                        No Image
                      </div>
                    )}

                    <div className="flex-1">
                      {isEditing ? (
                        <div className="grid grid-cols-1 gap-2">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="rounded border border-gray-700 bg-gray-900 p-2"
                          />
                          <input
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="rounded border border-gray-700 bg-gray-900 p-2"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => void handleSave(member.id)}
                              className="rounded bg-[#E87A27] px-3 py-1"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded bg-gray-700 px-3 py-1"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-lg font-semibold">
                            {member.name || "Untitled"}
                          </div>
                          <div className="text-sm text-gray-300">
                            {member.role || "No role"}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() => startEdit(member)}
                              className="rounded bg-gray-700 px-2 py-1"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => void handleDelete(member.id)}
                              className="rounded bg-red-600 px-2 py-1"
                            >
                              Delete
                            </button>
                            <div className="ml-2 flex gap-1">
                              <button
                                title="Move up"
                                onClick={() =>
                                  void swapPositions(index, index - 1)
                                }
                                disabled={index === 0}
                                className="rounded bg-gray-700 px-2 py-1 disabled:opacity-40"
                              >
                                ▲
                              </button>
                              <button
                                title="Move down"
                                onClick={() =>
                                  void swapPositions(index, index + 1)
                                }
                                disabled={index === members.length - 1}
                                className="rounded bg-gray-700 px-2 py-1 disabled:opacity-40"
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
