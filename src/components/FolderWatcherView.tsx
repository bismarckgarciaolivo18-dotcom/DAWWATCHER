import type { FolderWatcherApi } from '@/hooks/useFolderWatcher';
import { formatDateTime } from '@/lib/utils';
import { FolderOpen, FolderPlus, Pause, Play, X, Scan, CheckCircle2, Radio } from 'lucide-react';

interface FolderWatcherViewProps {
  watcher: FolderWatcherApi;
}

export function FolderWatcherView({ watcher }: FolderWatcherViewProps) {
  const supported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Carpeta vigilada</h1>
          <p className="text-sm text-slate-500 mt-1">
            Elige una carpeta donde guardas tus proyectos de DAW. La app detectará automáticamente
            los proyectos nuevos y creará canciones con CST ID.
          </p>
        </div>

        {!supported && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm text-amber-700">
              Tu navegador no soporta la API de acceso a carpetas. Para usar esta función necesitas
              Chrome, Edge u otro navegador basado en Chromium (versión 86+).
            </p>
          </div>
        )}

        {watcher.folderName ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Folder header */}
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  watcher.active ? 'bg-emerald-50' : 'bg-slate-100'
                }`}>
                  <FolderOpen className={`w-6 h-6 ${watcher.active ? 'text-emerald-600' : 'text-slate-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-slate-900 truncate">{watcher.folderName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${watcher.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    <span className="text-xs text-slate-500">
                      {watcher.active ? (watcher.scanning ? 'Escaneando…' : 'Vigilando') : 'Pausado'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={watcher.toggleWatcher}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  {watcher.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {watcher.active ? 'Pausar' : 'Reanudar'}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="px-6 py-5 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Estado</p>
                <div className="flex items-center gap-1.5">
                  {watcher.active ? (
                    <Radio className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Pause className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-sm font-medium text-slate-700">
                    {watcher.active ? 'Activo' : 'Pausado'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Detectadas</p>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">{watcher.detectedCount}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Último escaneo</p>
                <div className="flex items-center gap-1.5">
                  <Scan className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">
                    {watcher.lastScan ? formatDateTime(watcher.lastScan.toISOString()) : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <Scan className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  La carpeta se escanea cada 5 segundos. Los proyectos se agrupan por carpeta para
                  evitar duplicados. Extensiones reconocidas: .als, .flp, .logicx, .logic, .band, .ptx, .cpr, .rpp, .mpt.
                </p>
              </div>
            </div>

            {/* Clear */}
            <div className="px-6 py-4 border-t border-slate-100">
              <button
                onClick={watcher.clearFolder}
                className="inline-flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                Dejar de vigilar esta carpeta
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
              <FolderPlus className="w-8 h-8 text-slate-300" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Sin carpeta seleccionada</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
              Selecciona la carpeta donde guardas tus proyectos de DAW para empezar a detectar canciones automáticamente.
            </p>
            <button
              onClick={watcher.pickFolder}
              disabled={!supported}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FolderOpen className="w-4 h-4" />
              Elegir carpeta
            </button>
          </div>
        )}

        {watcher.folderName && (
          <button
            onClick={watcher.pickFolder}
            className="mt-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            Cambiar carpeta
          </button>
        )}
      </div>
    </div>
  );
}
