"use client";

export function JumpToBottomButton({
  visible,
  count,
  onClick,
}: {
  visible: boolean;
  count: number;
  onClick: () => void;
}) {
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-medium shadow-lg transition-colors hover:bg-border-subtle"
      aria-label={count > 0 ? `${count} new messages, jump to bottom` : "Jump to bottom"}
    >
      <span aria-hidden>↓</span>
      {count > 0 ? `${count} new` : "Jump to latest"}
    </button>
  );
}
