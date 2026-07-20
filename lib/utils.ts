import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInHours, differenceInMinutes, format, isToday, isYesterday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(amount: number): string {
  return `Rs. ${new Intl.NumberFormat("en-PK").format(amount)}`;
}

export function formatChatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();

  const minutes = differenceInMinutes(now, date);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (isToday(date)) return `${differenceInHours(now, date)}h`;
  if (isYesterday(date)) return "Yesterday";
  return format(date, "d MMM");
}
