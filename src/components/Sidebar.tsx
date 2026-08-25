import { Music, FolderOpen, LayoutDashboard, AudioLines } from 'lucide-react';

export type View = 'dashboard' | 'folder';

interface SidebarProps {
  current: View;
  onNavigate: (view: View) => void;
  songCount: number;
  watcherActive: boolean;
}

export function Sidebar({ current, onNavigate, songCount, watcherActive }: SidebarProps) {
  const items: { id: View; label: string; icon: typeof Music; badge?: string }[] = [
    { id: 'dashboard', label: 'Canciones', icon: LayoutDashboard, badge: songCount > 0 ? String(songCount) : undefined },
    { id: 'folder', label: 'Carpeta', icon: FolderOpen },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center">
            <AudioLines className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">CST Studio</h1>
            <p className="text-[11px] text-slate-400">Catalizador de canciones</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${watcherActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
          <span className="text-[11px] text-slate-400">
            {watcherActive ? 'Vigilando carpeta' : 'Inactivo'}
          </span>
        </div>
      </div>
    </aside>
  );
}
