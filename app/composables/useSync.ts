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
            if (task.payload.clientUuid) {
              await db.journalEntries.where('id').equals(task.payload.clientUuid).modify({ synced: 1 });
            }
            // Note: payload.clientUuid should map to local DB id if we use UUID as PK in Dexie?
            // In db.ts, journalEntries PK is 'id'. We should use the SAME UUID for both.
          } else if (task.action === 'update') {
            if (!canEdit) {
              console.warn('Skipping update sync: Server editing disabled', task);
              // We should probably remove it from queue to stop infinite retries?
              // Or keep it until enabled? 
              // User decision: "Discard or skip". Let's discard to keep queue clean.
              await db.syncQueue.delete(task.id!);
              continue;
            }
            await $fetch(`/api/journals/${task.payload.id}`, { // task.payload.id is the UUID
              method: 'PUT',
              body: task.payload
            });
            await db.journalEntries.update(task.payload.id, { synced: 1 });
          } else if (task.action === 'delete') {
            // Implement delete API if needed
            await $fetch(`/api/journals/${task.payload.id}`, { method: 'DELETE' });
          }

          // Remove from queue on success
          await db.syncQueue.delete(task.id!);

        } catch (e) {
          console.error('Sync failed for task', task, e);
          // Keep in queue for retry, unless 4xx fatal error?
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
  const pullChanges = async (forceFull = false) => {
    if (!online.value || isSyncing.value) return;
    isSyncing.value = true;

    try {
      const query: any = {};
      if (!forceFull && lastSynced.value) {
        query.updatedAfter = lastSynced.value;
      }

      // Fetch from API (we need to implement GET with query params in existing journals.get.ts? Check it.)
      const journals = await $fetch('/api/journals', { query });
      console.log('UserSync: Pulled journals from server:', journals); // Debug log

      if (journals && Array.isArray(journals) && journals.length > 0) {
        const entries = journals.map((j: any) => {
          // Map response to local DB schema
          // Handle potential snake_case vs camelCase issues from different Drizzle versions/configs
          const uuid = j.clientUuid;
          const remoteId = uuid || j.id; // Fallback to ID if UUID is missing (shouldn't happen for new entries)

          return {
            id: remoteId,
            content: j.content,
            moodScore: j.moodScore,
            tags: j.tags,
            distortionTags: j.distortionTags,
            advice: j.advice,
            fact: j.fact,
            emotion: j.emotion,
            createdAt: new Date(j.createdAt),
            updatedAt: j.updatedAt ? new Date(j.updatedAt) : null,
            synced: 1
          };
        });

        await db.journalEntries.bulkPut(entries);
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
