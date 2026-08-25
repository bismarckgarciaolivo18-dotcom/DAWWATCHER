import { DAW_EXTENSIONS } from './constants';
import type { DawType } from '@/types/song';

export function cleanTitle(filename: string): string {
  const withoutExt = filename.replace(/\.[^/.]+$/, '');
  return withoutExt
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getExtension(filename: string): string {
  const match = filename.match(/\.[^/.]+$/);
  return match ? match[0].toLowerCase() : '';
}

export function detectDaw(filename: string): DawType {
  const ext = getExtension(filename);
  return DAW_EXTENSIONS[ext] ?? 'unknown';
}

export function getProjectFolder(path: string): string {
  const parts = path.replace(/\/$/, '').split('/');
  return parts.slice(0, -1).join('/') || path;
}

const monthNames = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, '0');
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, '0');
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${mins}`;
}

export function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'hace un momento';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)} d`;
  return formatDate(iso);
}
