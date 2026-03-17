"use client";

import { LampContainer } from "@/components/ui/lamp";
import { motion } from "framer-motion";

export default function HeroAlchemy() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-black font-sans">
      <LampContainer className="justify-start pt-64 md:pt-80">
        <motion.div
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="flex flex-col items-center justify-center text-center mt-56 md:mt-72 z-50"
        >
          <h1 className="text-white text-7xl md:text-9xl lg:text-[11rem] font-bold uppercase tracking-tight leading-[0.9] translate-y-6 md:translate-y-8">
            We Are
            <br />
            <span className="bg-linear-to-b from-amber-400 to-orange-600 bg-clip-text text-transparent">
              Alchemy
            </span>
          </h1>
          <p className="mt-8 md:mt-12 text-zinc-500 text-xs md:text-sm tracking-[0.2em] md:tracking-[0.4em] uppercase font-light">
            Transmuting into transcendence
          </p>
        </motion.div>
      </LampContainer>
    </main>
  );
}
