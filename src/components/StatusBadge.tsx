import type { SongStatus, TitleStatus } from '@/types/song';
import { STATUS_COLORS, STATUS_LABELS, TITLE_STATUS_LABELS } from '@/lib/constants';
import { Lock, Edit3 } from 'lucide-react';

export function StatusBadge({ status }: { status: SongStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function TitleStatusBadge({ status }: { status: TitleStatus }) {
  const isDefinitive = status === 'definitive';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
        isDefinitive
          ? 'bg-slate-100 text-slate-600 border-slate-200'
          : 'bg-violet-50 text-violet-600 border-violet-200'
      }`}
    >
      {isDefinitive ? <Lock className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
      {TITLE_STATUS_LABELS[status]}
    </span>
  );
}
