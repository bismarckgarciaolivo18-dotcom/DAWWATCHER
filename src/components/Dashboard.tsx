import { useMemo, useState } from 'react';
import type { Song } from '@/types/song';
import { SongCard } from './SongCard';
import { STATUS_LABELS } from '@/lib/constants';
import { Search, Music2, Inbox } from 'lucide-react';

interface DashboardProps {
  songs: Song[];
  onSongClick: (song: Song) => void;
  onGoToFolder: () => void;
}

type SortKey = 'recent' | 'title' | 'cstId';
type FilterStatus = 'all' | 'idea' | 'in_progress' | 'ready';

export function Dashboard({ songs, onSongClick, onGoToFolder }: DashboardProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const filtered = useMemo(() => {
    let result = songs;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.cst_id.toLowerCase().includes(q) ||
          (s.artist?.toLowerCase().includes(q) ?? false),
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter((s) => s.status === filterStatus);
    }

    const sorted = [...result];
    if (sortKey === 'recent') {
      sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    } else if (sortKey === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      sorted.sort((a, b) => a.cst_id.localeCompare(b.cst_id));
    }

    return sorted;
  }, [songs, search, sortKey, filterStatus]);

  if (songs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
            <Inbox className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">No hay canciones todavía</h2>
          <p className="text-sm text-slate-500 mb-6">
            Selecciona una carpeta para vigilar y empieza a guardar proyectos desde tu DAW.
            Las canciones aparecerán aquí automáticamente.
          </p>
          <button
            onClick={onGoToFolder}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <Music2 className="w-4 h-4" />
            Elegir carpeta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Canciones</h1>
          <p className="text-sm text-slate-500 mt-1">
            {songs.length} {songs.length === 1 ? 'canción' : 'canciones'} en total
          </p>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título, artista o CST ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            {(Object.keys(STATUS_LABELS) as Array<keyof typeof STATUS_LABELS>).map((key) => (
              <option key={key} value={key}>{STATUS_LABELS[key]}</option>
            ))}
          </select>

          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all cursor-pointer"
          >
            <option value="recent">Más recientes</option>
            <option value="title">Por título</option>
            <option value="cstId">Por CST ID</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-sm">No se encontraron canciones con esos filtros.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
            {filtered.map((song) => (
              <SongCard key={song.id} song={song} onClick={() => onSongClick(song)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
