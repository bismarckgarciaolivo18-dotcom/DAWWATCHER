import { useEffect, useRef, useState } from 'react';
import type { ActivityEvent, Song, SongStatus } from '@/types/song';
import { STATUS_LABELS } from '@/lib/constants';
import { fetchActivityEvents, updateSong, deleteSong } from '@/lib/songs';
import { formatDateTime, relativeTime } from '@/lib/utils';
import { StatusBadge, TitleStatusBadge } from './StatusBadge';
import { TitleStatusModal } from './TitleStatusModal';
import {
  ArrowLeft, Lock, Edit3, Save, Trash2, User, FileMusic,
  Clock, History, X, Music2, FolderOpen,
} from 'lucide-react';

interface SongDetailProps {
  song: Song;
  onBack: () => void;
  onSongUpdated: () => void;
}

const EVENT_LABELS: Record<ActivityEvent['type'], string> = {
  PROJECT_DETECTED: 'Proyecto detectado',
  SONG_UPDATED: 'Canción actualizada',
  TITLE_LOCKED: 'Título bloqueado',
};

export function SongDetail({ song, onBack, onSongUpdated }: SongDetailProps) {
  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist ?? '');
  const [status, setStatus] = useState<SongStatus>(song.status);
  const [notes, setNotes] = useState(song.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dirty, setDirty] = useState(false);
  const titleModalShownRef = useRef(false);

  const isDefinitive = song.title_status === 'definitive';

  useEffect(() => {
    fetchActivityEvents(song.id)
      .then(setEvents)
      .catch((err) => console.error('Failed to fetch events:', err));
  }, [song.id, savedAt]);

  useEffect(() => {
    setTitle(song.title);
    setArtist(song.artist ?? '');
    setStatus(song.status);
    setNotes(song.notes ?? '');
    setDirty(false);
  }, [song]);

  function handleFieldChange<T>(setter: (v: T) => void, value: T) {
    setter(value);
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updates: Parameters<typeof updateSong>[1] = {
        artist: artist.trim() || null,
        status,
        notes: notes.trim() || null,
      };

      if (!isDefinitive && title.trim() !== song.title) {
        updates.title = title.trim();
      }

      await updateSong(song.id, updates);
      setDirty(false);
      setSavedAt(new Date());
      onSongUpdated();
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteSong(song.id);
      onSongUpdated();
      onBack();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  }

  function handleBack() {
    if (dirty) {
      handleSave();
    }

    if (!titleModalShownRef.current && song.title_status === 'preliminary') {
      titleModalShownRef.current = true;
      setShowTitleModal(true);
      return;
    }

    onBack();
  }

  function handleTitleModalClose() {
    setShowTitleModal(false);
    onBack();
  }

  function handleTitleLocked() {
    setShowTitleModal(false);
    onSongUpdated();
    onBack();
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-slate-900 truncate">{song.title}</h1>
                <TitleStatusBadge status={song.title_status} />
              </div>
              <p className="text-sm font-mono text-slate-400">{song.cst_id}</p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
              title="Eliminar canción"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-5 bg-white rounded-2xl border border-slate-200 p-6">
            {/* Title */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                <Music2 className="w-3.5 h-3.5" />
                Título
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleFieldChange(setTitle, e.target.value)}
                  disabled={isDefinitive}
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all ${
                    isDefinitive
                      ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed pr-10'
                      : 'bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300'
                  }`}
                />
                {isDefinitive && (
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                )}
              </div>
              {isDefinitive && (
                <p className="text-xs text-slate-400 mt-1.5">
                  El título está bloqueado como definitivo.
                </p>
              )}
            </div>

            {/* Artist */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                <User className="w-3.5 h-3.5" />
                Artista
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => handleFieldChange(setArtist, e.target.value)}
                placeholder="Nombre del artista"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all"
              />
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                <FileMusic className="w-3.5 h-3.5" />
                Estado
              </label>
              <div className="flex gap-2">
                {(Object.keys(STATUS_LABELS) as SongStatus[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => handleFieldChange(setStatus, key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      status === key
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {STATUS_LABELS[key]}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                <Edit3 className="w-3.5 h-3.5" />
                Notas
              </label>
              <textarea
                value={notes}
                onChange={(e) => handleFieldChange(setNotes, e.target.value)}
                placeholder="Agrega notas sobre esta canción…"
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all resize-none"
              />
            </div>

            {/* Save */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={!dirty || saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
              {savedAt && !dirty && (
                <span className="text-xs text-emerald-600">Guardado {relativeTime(savedAt.toISOString())}</span>
              )}
              {dirty && (
                <span className="text-xs text-amber-500">Cambios sin guardar</span>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Información del proyecto
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <FolderOpen className="w-3.5 h-3.5" />
                  Carpeta
                </div>
                <p className="text-slate-700 font-mono text-xs truncate" title={song.project_path}>
                  {song.project_path}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <FileMusic className="w-3.5 h-3.5" />
                  Archivo
                </div>
                <p className="text-slate-700 font-mono text-xs truncate" title={song.project_file ?? ''}>
                  {song.project_file ?? '—'}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  Creada
                </div>
                <p className="text-slate-700 text-xs">{formatDateTime(song.created_at)}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  Última detección
                </div>
                <p className="text-slate-700 text-xs">{formatDateTime(song.last_seen_at)}</p>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          {events.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                <History className="w-3.5 h-3.5" />
                Actividad
              </h3>
              <div className="space-y-2.5">
                {events.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{EVENT_LABELS[event.type]}</span>
                    <span className="text-xs text-slate-400">{relativeTime(event.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showTitleModal && (
        <TitleStatusModal
          song={song}
          onClose={handleTitleModalClose}
          onLocked={handleTitleLocked}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">¿Eliminar canción?</h2>
              <button onClick={() => setShowDeleteConfirm(false)} className="text-slate-300 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Se eliminará <span className="font-semibold text-slate-700">"{song.title}"</span> ({song.cst_id})
              y todo su historial. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
