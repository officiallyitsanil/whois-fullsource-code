import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDomain(url: string) {
  try {
    let domain = url.trim();
    if (!domain.startsWith("http://") && !domain.startsWith("https://")) {
      domain = "http://" + domain;
    }
    const urlObj = new URL(domain);
    return urlObj.hostname.replace(/^www\./, "");
  } catch (e) {
    return url.trim().replace(/^www\./, "").split("/")[0];
  }
}

export function formatAge(days: number | null | undefined) {
  if (!days) return "Unknown";
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  if (years === 0) return `${months} months`;
  if (months === 0) return `${years} years`;
  return `${years} years, ${months} months`;
}
