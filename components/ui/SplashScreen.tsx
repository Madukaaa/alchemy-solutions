"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [stage, setStage] = useState<"visible" | "fading" | "hidden">("visible");

  useEffect(() => {
    // Wait 2 seconds before fading out
    const fadeTimer = setTimeout(() => {
      setStage("fading");
    }, 2000);

    // Completely hide after transition finishes
    const hideTimer = setTimeout(() => {
      setStage("hidden");
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (stage === "hidden") return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${
        stage === "fading" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={stage !== "visible"}
    >
      <Image
        src="/Alchemy logo ai-02.png"
        alt="Alchemy Logo"
        width={210}
        height={70}
        className="object-contain"
        priority
      />
    </div>
  );
}
