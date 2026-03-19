"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import ServicesBg from "./ServicesBackground";

type ServicesHeroProps = {
  title: string;
  highlight: string;
};

const titleVariants: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: "easeOut" },
  },
};

const ServicesHero = memo(function ServicesHero({
  title,
  highlight,
}: ServicesHeroProps) {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <ServicesBg
        amplitude={2.3}
        distance={0.4}
        enableMouseInteraction={true}
      />

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div className="m-4 max-w-4xl px-6 text-center">
          <motion.h1
            variants={titleVariants}
            initial="initial"
            animate="animate"
            className="text-4xl font-bold uppercase leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {title}
            <span className="mt-2 block text-xl font-medium text-brand sm:text-2xl md:mt-0 md:text-3xl lg:text-4xl">
              {highlight}
            </span>
          </motion.h1>
        </div>
      </div>
    </section>
  );
});

export default ServicesHero;
