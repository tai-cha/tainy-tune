import { db, type JournalEntry, type SyncQueueItem } from '~/utils/local-db';
import { useOnline, useLocalStorage } from '@vueuse/core';
import { v4 as uuidv4 } from 'uuid';
import { ref, watch } from 'vue';
export const useSync = () => {
  const online = useOnline();
  const isSyncing = ref(false);
  const lastSynced = useLocalStorage<string | null>('last-synced-at', null); // Date string or timestamp

  // Helper to get client UUID properly
  const getUUID = () => {
    return uuidv4();
  };

  /**
   * PUSH SYNC: Process the offline queue
   */
  const pushChanges = async () => {
    if (!online.value || isSyncing.value) return;
    isSyncing.value = true;

    try {
      // 1. Fetch public settings to check edit permissions
      const settings = await $fetch('/api/settings/public');
      const canEdit = settings.allowJournalEditing;

      // 2. Get all queued items
      const queue = await db.syncQueue.toArray();
      if (queue.length === 0) {
        isSyncing.value = false;
        return;
      }

      for (const task of queue) {
        try {
          if (task.action === 'create') {
            await $fetch('/api/journal', {
              method: 'POST',
              body: task.payload
            });
            // Update local entry sync status
            const id = task.payload?.id;
            if (id == null) {
              console.error('Sync error: Missing payload ID for create task', task);
            } else {
              await db.journalEntries.update(id, { synced: 1 });
            }

          } else if (task.action === 'update') {
            if (!task.payload?.id) {
              console.warn('Skipping update sync: missing payload.id', task);
              await db.syncQueue.delete(task.id!);
              continue;
            }
            if (!canEdit) {
              console.warn('Skipping update sync: Server editing disabled', task);
              await db.syncQueue.delete(task.id!);
              // Mark as synced locally since we resolved the queue item (by ignoring the server update)
              await db.journalEntries.update(task.payload.id, { synced: 1 });
              continue;
            }
            await $fetch(`/api/journals/${task.payload.id}`, { // task.payload.id is the UUID
              method: 'PUT',
              body: task.payload
            });
            await db.journalEntries.update(task.payload.id, { synced: 1 });
          } else if (task.action === 'delete') {
            if (!task.payload?.id) {
              console.warn('Skipping delete sync: missing payload.id', task);
              await db.syncQueue.delete(task.id!);
              continue;
            }
            await $fetch(`/api/journals/${task.payload.id}`, { method: 'DELETE' });
            // Also remove from local DB
            await db.journalEntries.delete(task.payload.id);
          }

          // Remove from queue on success
          await db.syncQueue.delete(task.id!);

        } catch (e: any) {
          const status = e.response?.status || e.status;
          if (typeof status === 'number' && status >= 400 && status < 500) {
            console.error(`Sync fatal error (${status}) for task`, task, e);
            await db.syncQueue.delete(task.id!);
          } else {
            console.error(`Sync transient error (status: ${status ?? 'network'}) for task`, task, e);
          }
        }
      }
    } catch (e) {
      console.error('Push sync failed', e);
    } finally {
      isSyncing.value = false;
    }
  };

  /**
   * PULL SYNC: Fetch changes from server
   */
  interface JournalPullQuery {
    updatedAfter?: string;
  }

  const pullChanges = async (forceFull = false) => {
    if (!online.value || isSyncing.value) return;
    isSyncing.value = true;

    try {
      const query: JournalPullQuery = {};
      if (!forceFull && lastSynced.value) {
        query.updatedAfter = lastSynced.value;
      }

      // Fetch from API (we need to implement GET with query params in existing journals.get.ts? Check it.)
      const journals = await $fetch('/api/journals', { query });
      console.log('UserSync: Pulled journals from server:', journals); // Debug log

      if (journals && Array.isArray(journals) && journals.length > 0) {
        // 1. Get local unsynced entries to prevent overwriting
        const unsyncedEntries = await db.journalEntries.where('synced').equals(0).toArray();
        const unsyncedIds = new Set(unsyncedEntries.map(e => e.id));

        const entries = journals
          .filter((j) => {
            // 2. Conflict resolution: Skip if local has unsynced changes
            if (unsyncedIds.has(j.id)) {
              console.warn(`Conflict detected for journal ${j.id}. KEEPING local unsynced version.`);
              return false;
            }
            return true;
          })
          .map((j) => ({
            id: j.id, // Direct UUID from server/local
            content: j.content,
            moodScore: j.moodScore,
            tags: j.tags ?? [],
            distortionTags: j.distortionTags ?? [],
            advice: j.advice ?? '',
            fact: j.fact ?? '',
            emotion: j.emotion ?? '',
            createdAt: new Date(j.createdAt),
            updatedAt: j.updatedAt ? new Date(j.updatedAt) : null,
            synced: 1
          }));

        if (entries.length > 0) {
          await db.journalEntries.bulkPut(entries);
        }
      }

      lastSynced.value = new Date().toISOString();

    } catch (e) {
      console.error('Pull sync failed', e);
    } finally {
      isSyncing.value = false;
    }
  };

  // Watch for online status
  watch(online, (isOnline) => {
    if (isOnline) {
      pushChanges().then(() => pullChanges());
    }
  });

  return {
    pushChanges,
    pullChanges,
    isSyncing,
    online,
    getUUID
  };
};
