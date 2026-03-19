"use client";

import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

export default function AboutSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const logoVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 1,
        type: "spring" as const,
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <div
      ref={ref}
      className="relative overflow-hidden bg-black px-6 py-16 text-white md:px-16 lg:px-32"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 0.1 } : {}}
        transition={{ duration: 1.5 }}
        className="pointer-events-none absolute inset-0"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="relative z-10 gap-12 px-0 md:flex md:items-start md:justify-between md:px-12"
      >
        <motion.div variants={itemVariants}>
          <div className="relative inline-block">
            <motion.div
              variants={logoVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="relative z-10"
            >
              <Image
                src="/Alchemy logo ai-02.png"
                alt="Alchemy"
                width={640}
                height={220}
                className="h-16 w-auto object-contain sm:h-20 md:h-24 lg:h-32"
                priority={false}
              />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="relative mt-6 md:mt-0 md:w-1/2"
        >
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 1,
              delay: 0.3,
              type: "spring",
              stiffness: 50,
            }}
            className="relative z-10 rounded-lg p-0 text-justify text-sm leading-relaxed text-white backdrop-blur-sm md:p-6 md:text-lg"
          >
            We are an IT and Advertising company delivering cutting-edge
            solutions that fuel growth. From software, web, and mobile apps to
            network services, we cover the full tech spectrum. Alongside, our
            creative advertising spanning social media, SEO, video, and email
            helps brands connect, engage, and thrive in the digital era.
          </motion.p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={inView ? { opacity: 1, width: "100%" } : {}}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="mt-16 h-0.5 bg-linear-to-r from-transparent via-[#E2791D] to-transparent"
      />
    </div>
  );
}
