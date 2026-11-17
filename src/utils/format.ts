export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

const dateTime = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const dateOnly = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const shortDate = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
});
const timeOnly = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});
const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));
export const formatDate = (iso: string) => dateOnly.format(new Date(iso));
export const formatShortDate = (iso: string) => shortDate.format(new Date(iso));
export const formatTime = (iso: string) => timeOnly.format(new Date(iso));

export function formatRelative(iso: string) {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return "just now";
  if (abs < 3600) return relative.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return relative.format(Math.round(diff / 3600), "hour");
  return relative.format(Math.round(diff / 86400), "day");
}
