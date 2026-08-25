export type TitleStatus = 'preliminary' | 'definitive';
export type SongStatus = 'idea' | 'in_progress' | 'ready';
export type DawType = 'ableton' | 'fl_studio' | 'logic' | 'unknown';
export type ActivityEventType = 'PROJECT_DETECTED' | 'SONG_UPDATED' | 'TITLE_LOCKED';

export interface Song {
  id: string;
  cst_id: string;
  title: string;
  title_status: TitleStatus;
  artist: string | null;
  status: SongStatus;
  notes: string | null;
  project_path: string;
  project_file: string | null;
  daw: DawType | null;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityEvent {
  id: string;
  song_id: string;
  type: ActivityEventType;
  created_at: string;
}

export interface SongInsert {
  cst_id: string;
  title: string;
  title_status?: TitleStatus;
  artist?: string | null;
  status?: SongStatus;
  notes?: string | null;
  project_path: string;
  project_file?: string | null;
  daw?: DawType | null;
  last_seen_at?: string;
}

export interface SongUpdate {
  title?: string;
  title_status?: TitleStatus;
  artist?: string | null;
  status?: SongStatus;
  notes?: string | null;
  project_file?: string | null;
  daw?: DawType | null;
  last_seen_at?: string;
  updated_at?: string;
}
