"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const adminUser = process.env.NEXT_PUBLIC_ADMIN_USER;
  const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASS;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hp, setHp] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Honeypot: if this hidden field is filled, likely a bot submission.
    if (hp.trim()) {
      setError("Bot detected");
      return;
    }

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    if (!adminUser || !adminPass) {
      setError("Admin credentials are not configured.");
      return;
    }

    if (username.trim() !== adminUser || password !== adminPass) {
      setError("Invalid admin username or password.");
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem("alchemy_admin_auth", "true");
      window.localStorage.setItem("alchemy_admin_user", username.trim());
      window.localStorage.setItem("alchemy_admin_role", "admin");
    }

    setError(null);
    router.push("/admin/admin-dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:flex flex-col items-start gap-4 px-6">
          <Image
            src="/logos/Alchemy logo ai-02.png"
            alt="Alchemy"
            width={224}
            height={72}
            className="w-40 md:w-56 h-auto"
            priority
          />
          <h1 className="text-2xl font-semibold">Admin Portal</h1>
          <p className="text-gray-300">
            Sign in to access the admin control panel. Admin actions have full
            access across the application.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-black text-white p-8 rounded-lg shadow-lg max-w-md w-full ring-1 ring-gray-800 mx-auto"
        >
          <div className="flex items-center gap-3 mb-4 md:hidden">
            <Image
              src="/logos/Alchemy logo ai-02.png"
              alt="Alchemy"
              width={48}
              height={48}
              className="w-12 h-auto"
              priority
            />
            <div>
              <div className="text-lg font-semibold">Admin Login</div>
              <div className="text-xs text-gray-400">
                Manage site-wide settings and content
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-2 hidden md:block">
            Admin Login
          </h2>
          {error && <div className="text-red-400 mb-2">{error}</div>}

          <label className="block mb-2">
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 p-2 bg-black text-white rounded border border-gray-700 placeholder-gray-500"
              autoComplete="username"
            />
          </label>

          <label className="block mb-4">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2 bg-black text-white rounded border border-gray-700 placeholder-gray-500"
              autoComplete="current-password"
            />
          </label>

          <label
            style={{ position: "absolute", left: "-9999px", top: "auto" }}
            aria-hidden
          >
            Do not fill this field
            <input
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              name="hp_field"
              tabIndex={-1}
            />
          </label>

          <button className="bg-brand hover:opacity-95 text-white px-4 py-2 rounded w-full">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

