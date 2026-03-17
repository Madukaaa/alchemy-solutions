"use client";

import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingCallButtonProps {
  phone?: string;
  ariaLabel?: string;
  className?: string;
  iconSize?: number;
}

export default function FloatingCallButton({
  phone = "+94719563675",
  ariaLabel = "Call Alchemy",
  className,
  iconSize = 20,
}: FloatingCallButtonProps) {
  const handleCall = () => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={handleCall}
      className={cn(
        "fixed bottom-4 right-4 z-60 h-14 w-14 md:bottom-10 md:right-10 md:h-16 md:w-16",
        "flex items-center justify-center rounded-full shadow-lg",
        "bg-orange-500 text-white transition-all duration-300 hover:bg-black",
        "hover:ring-4 hover:ring-orange-300",
        className,
      )}
    >
      <Phone size={iconSize} />
    </button>
  );
}
