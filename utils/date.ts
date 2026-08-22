const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatMessageTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

export function isSameCalendarDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export function formatDateDivider(iso: string): string {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameCalendarDay(iso, now.toISOString())) return "Today";
  if (isSameCalendarDay(iso, yesterday.toISOString())) return "Yesterday";
  return dateFormatter.format(new Date(iso));
}
