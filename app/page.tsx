"use client";

import { LampContainer } from "@/components/ui/lamp";
import { Poppins } from "next/font/google";
import { motion } from "framer-motion";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export default function Home() {
  return (
    <main className={`flex min-h-[140vh] flex-col items-center justify-start bg-black pt-64 ${poppins.className}`}>
      <LampContainer>
        <motion.div
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="flex flex-col items-center justify-center text-center mt-8 z-50"
        >
          <h1 className="text-white text-6xl md:text-8xl lg:text-[10rem] font-bold uppercase tracking-tight leading-[0.9]">
            We Are
            <br />
            <span className="bg-gradient-to-b from-amber-400 to-orange-600 bg-clip-text text-transparent">
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
