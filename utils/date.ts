const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

// Group creation and the socket's `conversation:updated` payload can leave a
// conversation with a `lastMessage`/timestamp that isn't a parseable date yet —
// render nothing rather than letting `Intl.DateTimeFormat` throw on `Invalid Date`.
export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : timeFormatter.format(date);
}

export function isSameCalendarDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export function formatDateDivider(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameCalendarDay(iso, now.toISOString())) return "Today";
  if (isSameCalendarDay(iso, yesterday.toISOString())) return "Yesterday";
  return dateFormatter.format(date);
}
