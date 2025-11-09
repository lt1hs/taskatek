import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDirection(locale: string): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function formatDate(date: string | Date, locale: string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

export function getRelativeTime(date: string | Date, locale: string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (locale === 'ar') {
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return formatDate(dateObj, locale);
  } else {
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(dateObj, locale);
  }
}

export function getPriorityLabel(priority: number, locale: string): string {
  const labels = {
    ar: ['منخفضة', 'متوسطة', 'عالية', 'عاجلة'],
    en: ['Low', 'Medium', 'High', 'Urgent'],
  };
  
  return labels[locale as 'ar' | 'en'][priority - 1] || labels[locale as 'ar' | 'en'][1];
}

export function getPriorityColor(priority: number): string {
  const colors = ['text-gray-500', 'text-blue-500', 'text-orange-500', 'text-red-500'];
  return colors[priority - 1] || colors[1];
}
