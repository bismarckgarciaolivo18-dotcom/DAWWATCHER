import type { Song } from '@/types/song';
import { StatusBadge, TitleStatusBadge } from './StatusBadge';
import { relativeTime } from '@/lib/utils';
import { Music2, User } from 'lucide-react';

interface SongCardProps {
  song: Song;
  onClick: () => void;
}

export function SongCard({ song, onClick }: SongCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-slate-900 group-hover:text-white text-slate-400 flex items-center justify-center transition-all shrink-0">
            <Music2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 text-sm truncate group-hover:text-slate-700">
              {song.title}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{song.cst_id}</p>
          </div>
        </div>
        <TitleStatusBadge status={song.title_status} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <StatusBadge status={song.status} />
        {song.artist && (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <User className="w-3 h-3" />
            {song.artist}
          </span>
        )}
        <span className="text-xs text-slate-400 ml-auto">
          {relativeTime(song.updated_at)}
        </span>
      </div>
    </button>
  );
}
