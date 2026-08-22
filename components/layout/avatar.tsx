"use client";

const PALETTE = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function Avatar({
  name,
  size = 36,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${className ?? ""}`}
      style={{ width: size, height: size, backgroundColor: colorFor(name || "?") }}
      aria-hidden
    >
      {initial}
    </div>
  );
}
