"use client";

import { useEffect, useState } from "react";

interface HoverAnimatedTextProps {
  text: string;
  className?: string;
}

export default function HoverAnimatedText({ text, className = "" }: HoverAnimatedTextProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    };

    checkTouchDevice();
    window.addEventListener("resize", checkTouchDevice);

    return () => {
      window.removeEventListener("resize", checkTouchDevice);
    };
  }, []);

  const handleMouseEnter = () => {
    if (!isTouchDevice) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice) {
      setIsHovered(false);
    }
  };

  return (
    <span
      className={`relative inline-block cursor-pointer ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span
        aria-hidden="true"
        className="absolute top-1/2 left-0 h-3 w-full -translate-y-1/2 bg-[#E87A27] transition-transform duration-700 ease-in-out"
        style={{
          transformOrigin: "left",
          transform: `scaleX(${isHovered && !isTouchDevice ? 1 : 0})`,
          zIndex: 5,
        }}
      />

      <span className="relative text-inherit font-inherit">
        {text.split("").map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className={`relative inline-block ${letter === " " ? "w-3" : ""}`}
            style={{ zIndex: index % 2 === 0 ? 1 : 10 }}
          >
            {letter}
          </span>
        ))}
      </span>
    </span>
  );
}
