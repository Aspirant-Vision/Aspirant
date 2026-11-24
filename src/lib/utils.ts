import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLpa(amount: number): string {
  return `₹${amount} LPA`;
}

export function formatFeeLakhs(amount: number): string {
  return `₹${amount}L /yr`;
}
