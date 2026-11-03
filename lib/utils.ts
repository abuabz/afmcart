import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeImageUrl(url?: string | null): string {
  if (!url) return "/placeholder.svg"
  // If image was saved with http://localhost:3000/uploads/... or http://127.0.0.1:3000/uploads/...
  // strip the domain so it loads cleanly from whatever VPS domain/IP the site is currently running on
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/uploads\//i.test(url)) {
    return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, "")
  }
  return url
}
