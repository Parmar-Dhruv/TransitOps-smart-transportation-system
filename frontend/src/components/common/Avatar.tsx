import { useState, useEffect } from "react";
import { cn } from "../../lib/utils";

interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  className?: string;
}

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-3xl",
  xxl: "h-32 w-32 text-4xl"
};

const getInitials = (name?: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0][0]?.toUpperCase() || "?";
};

// Generates a stable premium background gradient based on string name hash
const getGradientClass = (name?: string) => {
  if (!name) return "from-violet-600 to-indigo-600";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 5;
  const gradients = [
    "from-violet-600 to-indigo-600",
    "from-emerald-600 to-teal-600",
    "from-blue-600 to-cyan-600",
    "from-rose-600 to-orange-600",
    "from-amber-600 to-orange-600"
  ];
  return gradients[index];
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setImageError(false);
  }, [src]);

  const initials = getInitials(name);
  const gradient = getGradientClass(name);

  // If we have a valid profile image path, normalize it if relative
  const finalSrc = src && !src.startsWith("http") && !src.startsWith("blob:")
    ? `${window.location.origin}${src}`
    : src;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 select-none font-semibold border border-white/10 shadow-inner",
        sizeClasses[size],
        className
      )}
    >
      {finalSrc && !imageError ? (
        <img
          src={finalSrc}
          alt={name || "User Avatar"}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className={cn("h-full w-full flex items-center justify-center bg-gradient-to-br text-white shadow-inner", gradient)}>
          {initials}
        </div>
      )}
    </div>
  );
}
