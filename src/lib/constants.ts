import type { DawType, SongStatus, TitleStatus } from '@/types/song';

export const DAW_EXTENSIONS: Record<string, DawType> = {
  '.als': 'ableton',
  '.flp': 'fl_studio',
  '.logicx': 'logic',
  '.logic': 'logic',
  '.band': 'logic',
  '.ptx': 'unknown',
  '.cpr': 'unknown',
  '.rpp': 'unknown',
  '.mpt': 'unknown',
};

export const STATUS_LABELS: Record<SongStatus, string> = {
  idea: 'Idea',
  in_progress: 'En progreso',
  ready: 'Lista',
};

export const STATUS_COLORS: Record<SongStatus, string> = {
  idea: 'bg-amber-100 text-amber-700 border-amber-200',
  in_progress: 'bg-sky-100 text-sky-700 border-sky-200',
  ready: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export const TITLE_STATUS_LABELS: Record<TitleStatus, string> = {
  preliminary: 'Preliminar',
  definitive: 'Definitivo',
};

export const SCAN_INTERVAL_MS = 5000;
export const DEBOUNCE_MS = 3000;
