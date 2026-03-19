"use client";

import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";

const stats = [
  { value: 80, label: "Global Happy Clients" },
  { value: 600, label: "Projects Completed" },
  { value: 20, label: "Team Members" },
  { value: 550, label: "Digital Products" },
];

export default function CountSection() {
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.3 });

  return (
    <div className="bg-black text-white px-6 md:px-16 lg:px-32 py-16">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
        <div className="grid grid-cols-2 gap-y-10 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : { scale: 0 }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 12,
                delay: index * 0.3,
              }}
            >
              <div className="text-5xl sm:text-5xl md:text-6xl font-bold mb-2">
                {inView ? <CountUp end={stat.value} duration={3} /> : 0}+
              </div>
              <h3 className="text-brand">{stat.label}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}