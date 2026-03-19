"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  listBlogPosts,
  listDomeImages,
  listGallery,
} from "@/lib/firestoreHelpers";

type CountValue = number | null;

export default function ModDashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [time, setTime] = useState(() => new Date());
  const [blogCount, setBlogCount] = useState<CountValue>(null);
  const [galleryCount, setGalleryCount] = useState<CountValue>(null);
  const [domeCount, setDomeCount] = useState<CountValue>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const isAuthed = window.localStorage.getItem("alchemy_mod_auth") === "true";
    if (!isAuthed) {
      router.replace("/mod-login");
      return;
    }

    setUsername(window.localStorage.getItem("alchemy_mod_user") ?? "moderator");
  }, [router]);

  useEffect(() => {
    const t = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadCounts() {
      try {
        const posts = await listBlogPosts();
        if (mounted) {
          setBlogCount(Array.isArray(posts) ? posts.length : 0);
        }
      } catch {
        if (mounted) {
          setBlogCount(0);
        }
      }

      try {
        const g = await listGallery();
        if (mounted) {
          setGalleryCount(Array.isArray(g) ? g.length : 0);
        }
      } catch {
        if (mounted) {
          setGalleryCount(0);
        }
      }

      try {
        const d = await listDomeImages();
        if (mounted) {
          setDomeCount(Array.isArray(d) ? d.length : 0);
        }
      } catch {
        if (mounted) {
          setDomeCount(0);
        }
      }
    }

    void loadCounts();
    return () => {
      mounted = false;
    };
  }, []);

  // Keep one extra history entry; when user goes back, log out moderator session.
  useEffect(() => {
    const isAuthed =
      typeof window !== "undefined" &&
      window.localStorage.getItem("alchemy_mod_auth") === "true";
    if (!isAuthed) {
      return;
    }

    const onPop = () => {
      handleLogout();
    };

    try {
      window.history.pushState({ modGuard: true }, "");
      window.addEventListener("popstate", onPop);
    } catch {
      // Ignore browser history restrictions.
    }

    return () => {
      try {
        window.removeEventListener("popstate", onPop);
      } catch {
        // Ignore cleanup failures.
      }
    };
  }, []);

  function handleLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("alchemy_mod_auth");
      window.localStorage.removeItem("alchemy_mod_user");
      window.localStorage.removeItem("alchemy_mod_role");
    }
    router.replace("/mod-login");
  }

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white">
      <div className="bg-linear-to-r from-gray-800 via-gray-900 to-black p-6 rounded-lg ring-1 ring-gray-700 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image
              src="/Alchemy logo ai-02.png"
              alt="Alchemy"
              width={112}
              height={40}
              className="w-28 h-auto"
              priority
            />
            <div>
              <h1 className="text-2xl font-semibold">Moderator Dashboard</h1>
              <p className="text-sm text-gray-300">
                Welcome back{username ? `, ${username}` : ""} - manage content
                and review analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-400">Local time</div>
              <div className="text-lg font-medium">{fmtTime(time)}</div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm border border-gray-700"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg ring-1 ring-gray-700 flex items-center gap-3">
            <div className="p-2 bg-linear-to-br from-indigo-600 to-blue-500 rounded text-white">
              <span className="block h-6 w-6 text-center font-bold">B</span>
            </div>
            <div>
              <div className="text-sm text-gray-300">Blogs</div>
              <div className="text-xl font-semibold">
                {blogCount == null ? "-" : blogCount}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg ring-1 ring-gray-700 flex items-center gap-3 md:col-span-1">
            <div className="p-2 bg-linear-to-br from-green-500 to-emerald-600 rounded text-white">
              <span className="block h-6 w-6 text-center font-bold">G</span>
            </div>
            <div>
              <div className="text-sm text-gray-300">Gallery Images</div>
              <div className="text-xl font-semibold">
                {galleryCount == null ? "-" : galleryCount}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg ring-1 ring-gray-700 flex items-center gap-3 md:col-span-1">
            <div className="p-2 bg-linear-to-br from-yellow-600 to-orange-500 rounded text-white">
              <span className="block h-6 w-6 text-center font-bold">D</span>
            </div>
            <div>
              <div className="text-sm text-gray-300">Digital Marketing Gallery</div>
              <div className="text-xl font-semibold">
                {domeCount == null ? "-" : domeCount}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg ring-1 ring-gray-700 flex items-center gap-3 md:col-span-3">
            <div className="flex-1">
              <div className="text-sm text-gray-300">Quick Actions</div>
              <div className="mt-2 flex gap-2 flex-wrap">
                <Link
                  href="/admin/blog-admin?from=mod"
                  className="px-3 py-2 bg-[#E87A27] text-white rounded shadow-sm"
                >
                  Manage Blogs
                </Link>
                <Link
                  href="/admin/gallery-admin"
                  className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-700"
                >
                  Manage Gallery
                </Link>
                <Link
                  href="/admin/dome-gallery-admin"
                  className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-700"
                >
                  Digital Marketing Gallery Management
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/blog-admin?from=mod"
            className="p-4 bg-gray-800 text-white rounded shadow hover:shadow-lg ring-1 ring-gray-700"
          >
            Blog Management
          </Link>
          <Link
            href="/admin/gallery-admin"
            className="p-4 bg-gray-800 text-white rounded shadow hover:shadow-lg ring-1 ring-gray-700"
          >
            Gallery Management
          </Link>
          <Link
            href="/admin/dome-gallery-admin"
            className="p-4 bg-gray-800 text-white rounded shadow hover:shadow-lg ring-1 ring-gray-700"
          >
            Digital Marketing Gallery Management
          </Link>
        </div>
      </div>
    </div>
  );
}
