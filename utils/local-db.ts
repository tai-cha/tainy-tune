import Dexie, { type Table } from 'dexie';

export interface JournalEntry {
  id: string; // UUID (client or server)
  content: string;
  moodScore: number | null;
  tags?: string[];
  distortionTags?: string[];
  advice?: string;
  fact?: string;
  emotion?: string;
  createdAt: Date;
  updatedAt: Date | null;
  synced: number; // 0: not synced, 1: synced
  isAnalysisFailed?: boolean;
}

export interface SyncQueueItem {
  id?: number; // Auto-increment
  action: 'create' | 'update' | 'delete';
  payload: any;
  createdAt: number;
}

export class AppDatabase extends Dexie {
  journalEntries!: Table<JournalEntry>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super('TainyTuneDB');
    this.version(1).stores({
      journalEntries: 'id, createdAt, synced',
      syncQueue: '++id, createdAt'
    });
  }
}

export const db = new AppDatabase();
