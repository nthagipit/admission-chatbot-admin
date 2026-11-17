import { cn } from "@/utils/cn";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md";
  className?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const dimension = size === "sm" ? "size-8 text-xs" : "size-9 text-sm";
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "shrink-0 rounded-full object-cover",
          dimension,
          className,
        )}
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700",
        dimension,
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
