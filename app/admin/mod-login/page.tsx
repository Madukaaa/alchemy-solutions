"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ModLoginPage() {
  const router = useRouter();
  const modUser = process.env.NEXT_PUBLIC_MOD_USER;
  const modPass = process.env.NEXT_PUBLIC_MOD_PASS;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hp, setHp] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Honeypot: if hidden field is filled, likely a bot submission.
    if (hp.trim()) {
      setError("Bot detected");
      return;
    }

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    if (!modUser || !modPass) {
      setError("Moderator credentials are not configured.");
      return;
    }

    if (username.trim() !== modUser || password !== modPass) {
      setError("Invalid moderator username or password.");
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem("alchemy_mod_auth", "true");
      window.localStorage.setItem("alchemy_mod_user", username.trim());
      window.localStorage.setItem("alchemy_mod_role", "moderator");
    }

    setError(null);
    router.push("/mod-dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:flex flex-col items-start gap-4 px-6">
          <Image
            src="/Alchemy logo ai-02.png"
            alt="Alchemy"
            width={224}
            height={72}
            className="w-40 md:w-56 h-auto"
            priority
          />
          <h1 className="text-2xl font-semibold">Moderator Portal</h1>
          <p className="text-gray-300">
            Sign in to manage blog posts and gallery content. This portal is for
            moderators only.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-black text-white p-8 rounded-lg shadow-lg max-w-md w-full ring-1 ring-gray-800 mx-auto"
        >
          <div className="flex items-center gap-3 mb-4 md:hidden">
            <Image
              src="/Alchemy logo ai-02.png"
              alt="Alchemy"
              width={48}
              height={48}
              className="w-12 h-auto"
              priority
            />
            <div>
              <div className="text-lg font-semibold">Moderator Login</div>
              <div className="text-xs text-gray-400">
                Manage content securely
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-2 hidden md:block">
            Moderator Login
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
