import { ArrowLeft } from "lucide-react";

type CircleButtonProps = {
  position?:
    | "left"
    | "right"
    | "top"
    | "bottom"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center";
  customPosition?: string;
  size?: "small" | "medium" | "large" | "xlarge";
  className?: string;
  onClick?: () => void;
  arrowDirection?: "left" | "right" | "up" | "down";
};

export default function CircleButton({
  position = "left",
  customPosition,
  size = "large",
  className = "",
  onClick,
  arrowDirection = "left",
}: CircleButtonProps) {
  const sizeClasses = {
    small: "h-20 w-20",
    medium: "h-28 w-28",
    large: "h-32 w-32",
    xlarge: "h-[180px] w-[180px]",
  };

  const positionClasses = {
    left: "-left-6 -top-32",
    right: "-right-16 top-1/2 -translate-y-1/2",
    top: "-top-16 left-1/2 -translate-x-1/2",
    bottom: "-bottom-16 left-1/2 -translate-x-1/2",
    "top-left": "-left-8 -top-8",
    "top-right": "-right-8 -top-8",
    "bottom-left": "-bottom-8 -left-8",
    "bottom-right": "-bottom-8 -right-8",
    center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
  };

  const arrowIcons = {
    left: <ArrowLeft className="relative z-10 h-10 w-10 text-white" />,
    right: <ArrowLeft className="relative z-10 h-10 w-10 rotate-180 text-white" />,
    up: <ArrowLeft className="relative z-10 h-10 w-10 rotate-90 text-white" />,
    down: <ArrowLeft className="relative z-10 h-10 w-10 -rotate-90 text-white" />,
  };

  const finalPositionClass = customPosition || positionClasses[position] || positionClasses.left;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute z-20 flex items-center justify-center rounded-full transition-all duration-300 group ${sizeClasses[size]} ${finalPositionClass} ${className}`}
    >
      {arrowIcons[arrowDirection]}

      <span
        className="absolute inset-0 rounded-full bg-orange-500 opacity-0 transition-all duration-300 group-hover:scale-50 group-hover:opacity-100"
      />

      <span
        className="absolute inset-0 rounded-full border-2 border-orange-500 transition-transform duration-300 group-hover:scale-50"
      />
    </button>
  );
}
