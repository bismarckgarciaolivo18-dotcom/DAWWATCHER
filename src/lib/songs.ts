import { supabase } from './supabase';
import type { Song, SongInsert, SongUpdate, ActivityEvent, DawType } from '@/types/song';
import { cleanTitle, detectDaw, getExtension } from './utils';

export async function generateCstId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CST-${year}-`;

  const { data, error } = await supabase
    .from('songs')
    .select('cst_id')
    .like('cst_id', `${prefix}%`)
    .order('cst_id', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  let nextNum = 1;
  if (data?.cst_id) {
    const currentNum = parseInt(data.cst_id.replace(prefix, ''), 10);
    if (!isNaN(currentNum)) nextNum = currentNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(6, '0')}`;
}

export async function findSongByPath(projectPath: string): Promise<Song | null> {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('project_path', projectPath)
    .maybeSingle();

  if (error) throw error;
  return data as Song | null;
}

export async function createSongFromProject(
  projectPath: string,
  filename: string,
): Promise<Song> {
  const cstId = await generateCstId();
  const title = cleanTitle(filename);
  const daw: DawType = detectDaw(filename);
  const ext = getExtension(filename);

  const insert: SongInsert = {
    cst_id: cstId,
    title,
    title_status: 'preliminary',
    status: 'idea',
    project_path: projectPath,
    project_file: filename,
    daw: daw,
    last_seen_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('songs')
    .insert(insert)
    .select()
    .single();

  if (error) throw error;

  const song = data as Song;

  await logEvent(song.id, 'PROJECT_DETECTED');

  return song;
}

export async function updateSongLastSeen(
  songId: string,
  filename: string,
): Promise<void> {
  const { error } = await supabase
    .from('songs')
    .update({
      last_seen_at: new Date().toISOString(),
      project_file: filename,
      updated_at: new Date().toISOString(),
    })
    .eq('id', songId);

  if (error) throw error;

  await logEvent(songId, 'PROJECT_DETECTED');
}

export async function updateSong(
  songId: string,
  updates: SongUpdate,
): Promise<Song | null> {
  const { data, error } = await supabase
    .from('songs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', songId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Song | null;
}

export async function lockSongTitle(songId: string): Promise<void> {
  const { error } = await supabase
    .from('songs')
    .update({
      title_status: 'definitive',
      updated_at: new Date().toISOString(),
    })
    .eq('id', songId);

  if (error) throw error;

  await logEvent(songId, 'TITLE_LOCKED');
}

export async function fetchAllSongs(): Promise<Song[]> {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data as Song[]) ?? [];
}

export async function fetchSongById(id: string): Promise<Song | null> {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Song | null;
}

export async function fetchActivityEvents(songId: string): Promise<ActivityEvent[]> {
  const { data, error } = await supabase
    .from('activity_events')
    .select('*')
    .eq('song_id', songId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as ActivityEvent[]) ?? [];
}

export async function logEvent(
  songId: string,
  type: ActivityEvent['type'],
): Promise<void> {
  const { error } = await supabase
    .from('activity_events')
    .insert({ song_id: songId, type });

  if (error) throw error;
}

export async function deleteSong(songId: string): Promise<void> {
  const { error } = await supabase
    .from('songs')
    .delete()
    .eq('id', songId);

  if (error) throw error;
}
