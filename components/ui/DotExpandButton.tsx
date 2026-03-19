"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type DotExpandButtonProps = {
  text?: string;
  onClick?: () => void;
  size?: "default" | "large" | "xlarge";
};

const DotExpandButton = ({
  text = "About Us",
  onClick,
  size = "default",
}: DotExpandButtonProps) => {
  const [enableHover, setEnableHover] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      setEnableHover(false);
      return;
    }

    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const mdQuery = window.matchMedia("(min-width: 768px)");

    const update = () => setEnableHover(hoverQuery.matches && mdQuery.matches);
    update();

    const hoverListener = () => update();
    const mdListener = () => update();

    if (typeof hoverQuery.addEventListener === "function") {
      hoverQuery.addEventListener("change", hoverListener);
      mdQuery.addEventListener("change", mdListener);
    } else {
      hoverQuery.addListener(hoverListener);
      mdQuery.addListener(mdListener);
    }

    return () => {
      if (typeof hoverQuery.removeEventListener === "function") {
        hoverQuery.removeEventListener("change", hoverListener);
        mdQuery.removeEventListener("change", mdListener);
      } else {
        hoverQuery.removeListener(hoverListener);
        mdQuery.removeListener(mdListener);
      }
    };
  }, []);

  const sizeClasses = {
    default: "px-4 py-1.5 text-xs md:px-5 md:py-2 md:text-sm",
    large: "px-6 py-2.5 text-base md:px-8 md:py-3 md:text-lg",
    xlarge: "px-8 py-4 text-xl md:px-12 md:py-6 md:text-2xl",
  } as const;

  return (
    <motion.button
      type="submit"
      whileHover={enableHover ? "hover" : undefined}
      initial="rest"
      animate="rest"
      variants={{
        rest: { scale: 1 },
        hover: { scale: 1.05 },
      }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-full bg-[#E2791D] ${sizeClasses[size]} text-white md:hover:text-black md:transition-colors md:duration-300 font-semibold`}
    >
      <span className="relative z-10">{text}</span>

      <motion.span
        variants={{
          rest: { scale: 0, opacity: 0 },
          hover: { scale: 25, opacity: 1 },
        }}
        transition={
          enableHover ? { duration: 0.4, ease: "easeInOut" } : { duration: 0 }
        }
        className="absolute inset-0 z-0 flex items-center justify-center"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-white" />
      </motion.span>
    </motion.button>
  );
};

export default DotExpandButton;
