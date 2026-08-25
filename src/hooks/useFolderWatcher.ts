import { useCallback, useEffect, useRef, useState } from 'react';
import { DAW_EXTENSIONS, SCAN_INTERVAL_MS } from '@/lib/constants';
import { getExtension } from '@/lib/utils';
import { createSongFromProject, findSongByPath, updateSongLastSeen } from '@/lib/songs';

interface WatcherState {
  active: boolean;
  scanning: boolean;
  folderName: string | null;
  lastScan: Date | null;
  detectedCount: number;
}

interface FileSystemEntry {
  path: string;
  name: string;
  isDirectory: boolean;
}

async function readDirectoryRecursive(
  dirHandle: FileSystemDirectoryHandle,
  basePath: string,
  results: FileSystemEntry[],
  depth = 0,
): Promise<void> {
  if (depth > 3) return;

  const iterator = (dirHandle as unknown as {
    values(): AsyncIterableIterator<FileSystemHandle>;
  }).values();

  for await (const entry of iterator) {
    const fullPath = `${basePath}/${entry.name}`;
    if (entry.kind === 'directory') {
      results.push({ path: fullPath, name: entry.name, isDirectory: true });
      await readDirectoryRecursive(entry as FileSystemDirectoryHandle, fullPath, results, depth + 1);
    } else {
      results.push({ path: fullPath, name: entry.name, isDirectory: false });
    }
  }
}

function findProjectFiles(entries: FileSystemEntry[]): FileSystemEntry[] {
  return entries.filter((e) => {
    if (e.isDirectory) return false;
    const ext = getExtension(e.name);
    return ext in DAW_EXTENSIONS;
  });
}

function getProjectKey(filePath: string): { folderPath: string; filename: string } {
  const parts = filePath.replace(/^\//, '').split('/');
  const filename = parts[parts.length - 1];
  const folderPath = parts.slice(0, -1).join('/') || '/';
  return { folderPath, filename };
}

export interface FolderWatcherApi extends WatcherState {
  pickFolder: () => Promise<void>;
  toggleWatcher: () => void;
  clearFolder: () => void;
}

export function useFolderWatcher(onSongsChanged: () => void): FolderWatcherApi {
  const [state, setState] = useState<WatcherState>({
    active: false,
    scanning: false,
    folderName: null,
    lastScan: null,
    detectedCount: 0,
  });

  const dirHandleRef = useRef<FileSystemDirectoryHandle | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanningRef = useRef(false);
  const knownProjectsRef = useRef<Set<string>>(new Set());
  const onSongsChangedRef = useRef(onSongsChanged);
  onSongsChangedRef.current = onSongsChanged;

  const processEntries = useCallback(async (entries: FileSystemEntry[]) => {
    const projectFiles = findProjectFiles(entries);
    const groupedByFolder = new Map<string, string>();

    for (const file of projectFiles) {
      const { folderPath, filename } = getProjectKey(file.path);
      if (!groupedByFolder.has(folderPath)) {
        groupedByFolder.set(folderPath, filename);
      }
    }

    let newCount = 0;

    for (const [folderPath, filename] of groupedByFolder) {
      const existing = await findSongByPath(folderPath);
      if (existing) {
        if (!knownProjectsRef.current.has(folderPath)) {
          knownProjectsRef.current.add(folderPath);
        }
        await updateSongLastSeen(existing.id, filename);
      } else {
        await createSongFromProject(folderPath, filename);
        knownProjectsRef.current.add(folderPath);
        newCount++;
      }
    }

    if (newCount > 0 || groupedByFolder.size > 0) {
      onSongsChangedRef.current();
    }

    setState((prev) => ({
      ...prev,
      detectedCount: prev.detectedCount + newCount,
    }));
  }, []);

  const scan = useCallback(async () => {
    if (!dirHandleRef.current || scanningRef.current) return;
    scanningRef.current = true;
    setState((prev) => ({ ...prev, scanning: true }));

    try {
      const entries: FileSystemEntry[] = [];
      await readDirectoryRecursive(dirHandleRef.current, '', entries);
      await processEntries(entries);
      setState((prev) => ({
        ...prev,
        lastScan: new Date(),
      }));
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      scanningRef.current = false;
      setState((prev) => ({ ...prev, scanning: false }));
    }
  }, [processEntries]);

  const startWatcher = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      scan();
    }, SCAN_INTERVAL_MS);
    setState((prev) => ({ ...prev, active: true }));
    scan();
  }, [scan]);

  const stopWatcher = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState((prev) => ({ ...prev, active: false }));
  }, []);

  const pickFolder = useCallback(async () => {
    if (!('showDirectoryPicker' in window)) {
      alert('Tu navegador no soporta la API de acceso a carpetas. Usa Chrome, Edge u otro navegador basado en Chromium.');
      return;
    }

    try {
      // @ts-expect-error - showDirectoryPicker is not in TS lib types
      const handle: FileSystemDirectoryHandle = await window.showDirectoryPicker();
      dirHandleRef.current = handle;
      knownProjectsRef.current = new Set();
      setState((prev) => ({
        ...prev,
        folderName: handle.name,
        detectedCount: 0,
      }));
      startWatcher();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('Folder pick error:', err);
    }
  }, [startWatcher]);

  const toggleWatcher = useCallback(() => {
    if (state.active) {
      stopWatcher();
    } else {
      startWatcher();
    }
  }, [state.active, startWatcher, stopWatcher]);

  const clearFolder = useCallback(() => {
    stopWatcher();
    dirHandleRef.current = null;
    knownProjectsRef.current = new Set();
    setState({
      active: false,
      scanning: false,
      folderName: null,
      lastScan: null,
      detectedCount: 0,
    });
  }, [stopWatcher]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    ...state,
    pickFolder,
    toggleWatcher,
    clearFolder,
  };
}
