interface AccentColor {
  bg: string;
  border: string;
}

const PALETTE: AccentColor[] = [
  { bg: "bg-rose-500", border: "border-rose-500" },
  { bg: "bg-amber-500", border: "border-amber-500" },
  { bg: "bg-emerald-500", border: "border-emerald-500" },
  { bg: "bg-sky-500", border: "border-sky-500" },
  { bg: "bg-violet-500", border: "border-violet-500" },
  { bg: "bg-pink-500", border: "border-pink-500" },
  { bg: "bg-cyan-500", border: "border-cyan-500" },
  { bg: "bg-orange-500", border: "border-orange-500" },
];

export function accentColorFor(name: string): AccentColor {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length]!;
}
