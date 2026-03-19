"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  listBlogPosts,
  listGallery,
  listDomeImages,
  listFeaturedWork,
  listITProjects,
  listEventImages,
  listCareers,
} from "@/lib/firestoreHelpers";

type CountValue = number | null;

function StatCard({
  title,
  count,
  accent,
  icon,
}: {
  title: string;
  count: CountValue;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg ring-1 ring-gray-700 flex items-center gap-3">
      <div className={`p-2 rounded text-white ${accent}`}>{icon}</div>
      <div>
        <div className="text-sm text-gray-300">{title}</div>
        <div className="text-xl font-semibold">
          {count == null ? "-" : count}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [time, setTime] = useState(() => new Date());
  const [blogCount, setBlogCount] = useState<CountValue>(null);
  const [galleryCount, setGalleryCount] = useState<CountValue>(null);
  const [domeCount, setDomeCount] = useState<CountValue>(null);
  const [featuredWorkCount, setFeaturedWorkCount] = useState<CountValue>(null);
  const [itProjectsCount, setItProjectsCount] = useState<CountValue>(null);
  const [eventImagesCount, setEventImagesCount] = useState<CountValue>(null);
  const [careersCount, setCareersCount] = useState<CountValue>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const isAuthed =
      window.localStorage.getItem("alchemy_admin_auth") === "true";
    if (!isAuthed) {
      router.replace("/admin/admin-login");
      return;
    }

    setUsername(window.localStorage.getItem("alchemy_admin_user") ?? "");
    setRole(window.localStorage.getItem("alchemy_admin_role") ?? "");
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
        const items = await listGallery();
        if (mounted) {
          setGalleryCount(Array.isArray(items) ? items.length : 0);
        }
      } catch {
        if (mounted) {
          setGalleryCount(0);
        }
      }

      try {
        const items = await listDomeImages();
        if (mounted) {
          setDomeCount(Array.isArray(items) ? items.length : 0);
        }
      } catch {
        if (mounted) {
          setDomeCount(0);
        }
      }

      try {
        const items = await listFeaturedWork();
        if (mounted) {
          setFeaturedWorkCount(Array.isArray(items) ? items.length : 0);
        }
      } catch {
        if (mounted) {
          setFeaturedWorkCount(0);
        }
      }

      try {
        const items = await listITProjects();
        if (mounted) {
          setItProjectsCount(Array.isArray(items) ? items.length : 0);
        }
      } catch {
        if (mounted) {
          setItProjectsCount(0);
        }
      }

      try {
        const items = await listEventImages();
        if (mounted) {
          setEventImagesCount(Array.isArray(items) ? items.length : 0);
        }
      } catch {
        if (mounted) {
          setEventImagesCount(0);
        }
      }

      try {
        const items = await listCareers();
        if (mounted) {
          setCareersCount(Array.isArray(items) ? items.length : 0);
        }
      } catch {
        if (mounted) {
          setCareersCount(0);
        }
      }
    }

    loadCounts();

    return () => {
      mounted = false;
    };
  }, []);

  function handleLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("alchemy_admin_auth");
      window.localStorage.removeItem("alchemy_admin_user");
      window.localStorage.removeItem("alchemy_admin_role");
    }
    router.replace("/admin/admin-login");
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
              <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-gray-300">
                Welcome back{username ? `, ${username}` : ""} - admin control
                panel
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

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
          <StatCard
            title="Blogs"
            count={blogCount}
            accent="bg-gradient-to-br from-indigo-600 to-blue-500"
            icon={
              <span className="block h-6 w-6 text-center font-bold">B</span>
            }
          />
          <StatCard
            title="Gallery Images"
            count={galleryCount}
            accent="bg-gradient-to-br from-green-500 to-emerald-600"
            icon={
              <span className="block h-6 w-6 text-center font-bold">G</span>
            }
          />
          <StatCard
            title="Featured Work"
            count={featuredWorkCount}
            accent="bg-gradient-to-br from-purple-600 to-pink-500"
            icon={
              <span className="block h-6 w-6 text-center font-bold">F</span>
            }
          />
          <StatCard
            title="DM Gallery"
            count={domeCount}
            accent="bg-gradient-to-br from-yellow-600 to-orange-500"
            icon={
              <span className="block h-6 w-6 text-center font-bold">D</span>
            }
          />
          <StatCard
            title="IT Projects"
            count={itProjectsCount}
            accent="bg-gradient-to-br from-cyan-600 to-teal-500"
            icon={
              <span className="block h-6 w-6 text-center font-bold">I</span>
            }
          />
          <StatCard
            title="Event Images"
            count={eventImagesCount}
            accent="bg-gradient-to-br from-rose-600 to-red-500"
            icon={
              <span className="block h-6 w-6 text-center font-bold">E</span>
            }
          />
          <StatCard
            title="Careers"
            count={careersCount}
            accent="bg-gradient-to-br from-amber-600 to-yellow-500"
            icon={
              <span className="block h-6 w-6 text-center font-bold">C</span>
            }
          />
        </div>

        <div className="mt-4 bg-gray-800 p-4 rounded-lg ring-1 ring-gray-700">
          <div className="text-sm text-gray-300 mb-3">Quick Actions</div>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/admin/blog-admin"
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
            {role === "admin" && (
              <>
                <Link
                  href="/admin/it-admin"
                  className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-700"
                >
                  IT Projects
                </Link>
                <Link
                  href="/admin/featured-work-admin"
                  className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-700"
                >
                  Featured Work
                </Link>
                <Link
                  href="/admin/dome-gallery-admin"
                  className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-700"
                >
                  DM Gallery
                </Link>
                <Link
                  href="/admin/event-carousel-admin"
                  className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-700"
                >
                  Event Carousel
                </Link>
                <Link
                  href="/admin/client-logos-admin"
                  className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-700"
                >
                  Client Logos
                </Link>
                <Link
                  href="/admin/careers-admin"
                  className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-700"
                >
                  Careers
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/blog-admin"
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
          href="/admin/it-admin"
          className="p-4 bg-gray-800 text-white rounded shadow hover:shadow-lg ring-1 ring-gray-700"
        >
          IT Projects
        </Link>
        {role === "admin" && (
          <>
            <Link
              href="/admin/featured-work-admin"
              className="p-4 bg-gray-800 text-white rounded shadow hover:shadow-lg ring-1 ring-gray-700"
            >
              Featured Work Management
            </Link>
            <Link
              href="/admin/dome-gallery-admin"
              className="p-4 bg-gray-800 text-white rounded shadow hover:shadow-lg ring-1 ring-gray-700"
            >
              Digital Marketing Gallery Management
            </Link>
            <Link
              href="/admin/event-carousel-admin"
              className="p-4 bg-gray-800 text-white rounded shadow hover:shadow-lg ring-1 ring-gray-700"
            >
              Event Carousel Management
            </Link>
            <Link
              href="/admin/client-logos-admin"
              className="p-4 bg-gray-800 text-white rounded shadow hover:shadow-lg ring-1 ring-gray-700"
            >
              Client Logos Management
            </Link>
            <Link
              href="/admin/careers-admin"
              className="p-4 bg-gray-800 text-white rounded shadow hover:shadow-lg ring-1 ring-gray-700"
            >
              Careers Management
            </Link>
          </>
        )}
        <Link
          href="/admin/about-us-admin"
          className="p-4 bg-gray-800 text-white rounded shadow hover:shadow-lg ring-1 ring-gray-700"
        >
          About Us / Team
        </Link>
      </div>
    </div>
  );
}
