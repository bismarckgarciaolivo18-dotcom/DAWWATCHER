import { useCallback, useEffect, useState } from 'react';
import type { Song } from '@/types/song';
import { fetchAllSongs } from '@/lib/songs';
import { useFolderWatcher } from '@/hooks/useFolderWatcher';
import { Sidebar } from '@/components/Sidebar';
import type { View } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { SongDetail } from '@/components/SongDetail';
import { FolderWatcherView } from '@/components/FolderWatcherView';

export default function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSongs = useCallback(async () => {
    try {
      const data = await fetchAllSongs();
      setSongs(data);

      if (selectedSong) {
        const updated = data.find((s) => s.id === selectedSong.id);
        if (updated && JSON.stringify(updated) !== JSON.stringify(selectedSong)) {
          setSelectedSong(updated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch songs:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSong]);

  const watcher = useFolderWatcher(refreshSongs);

  useEffect(() => {
    refreshSongs();
  }, [refreshSongs]);

  function handleNavigate(view: View) {
    setCurrentView(view);
    setSelectedSong(null);
  }

  function handleSongClick(song: Song) {
    setSelectedSong(song);
  }

  function handleBackFromDetail() {
    setSelectedSong(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
          <span className="text-sm">Cargando…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        current={currentView}
        onNavigate={handleNavigate}
        songCount={songs.length}
        watcherActive={watcher.active}
      />

      <main className="flex-1 flex flex-col min-h-screen">
        {selectedSong ? (
          <SongDetail
            key={selectedSong.id}
            song={selectedSong}
            onBack={handleBackFromDetail}
            onSongUpdated={refreshSongs}
          />
        ) : currentView === 'dashboard' ? (
          <Dashboard
            songs={songs}
            onSongClick={handleSongClick}
            onGoToFolder={() => setCurrentView('folder')}
          />
        ) : (
          <FolderWatcherView watcher={watcher} />
        )}
      </main>
    </div>
  );
}
