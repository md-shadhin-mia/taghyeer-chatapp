"use client";

import { Avatar as BaseAvatar } from "@/components/layout/avatar";

export function Avatar({
  name,
  size,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return <BaseAvatar name={name} size={size} className={className} />;
}
