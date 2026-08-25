import { useState } from 'react';
import { Lock, Edit3, X } from 'lucide-react';
import type { Song } from '@/types/song';
import { lockSongTitle } from '@/lib/songs';

interface TitleStatusModalProps {
  song: Song;
  onClose: () => void;
  onLocked: () => void;
}

export function TitleStatusModal({ song, onClose, onLocked }: TitleStatusModalProps) {
  const [saving, setSaving] = useState(false);

  async function handleChoice(preliminary: boolean) {
    if (preliminary) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      await lockSongTitle(song.id);
      onLocked();
    } catch (err) {
      console.error('Failed to lock title:', err);
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="px-7 pt-7 pb-2">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <Edit3 className="w-6 h-6 text-slate-600" />
            </div>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-1.5">
            ¿Este título es preliminar o definitivo?
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-1">
            Título actual: <span className="font-semibold text-slate-700">"{song.title}"</span>
          </p>
          <p className="text-xs text-slate-400 mb-6">
            {song.cst_id}
          </p>
        </div>

        <div className="px-7 pb-7 space-y-3">
          <button
            onClick={() => handleChoice(true)}
            disabled={saving}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left group disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-lg bg-violet-50 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
              <Edit3 className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 text-sm">Preliminar</p>
              <p className="text-xs text-slate-500 mt-0.5">Puedo seguir editando el título. Me volverás a preguntar la próxima vez.</p>
            </div>
          </button>

          <button
            onClick={() => handleChoice(false)}
            disabled={saving}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all text-left group disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-white/10 flex items-center justify-center transition-colors">
              <Lock className="w-5 h-5 text-slate-600 group-hover:text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 group-hover:text-white text-sm transition-colors">Definitivo</p>
              <p className="text-xs text-slate-500 group-hover:text-slate-300 mt-0.5 transition-colors">
                El título se congela. No se puede editar ni se vuelve a preguntar.
              </p>
            </div>
          </button>
        </div>

        {saving && (
          <div className="px-7 pb-5 text-center">
            <span className="text-xs text-slate-400">Bloqueando título…</span>
          </div>
        )}
      </div>
    </div>
  );
}
