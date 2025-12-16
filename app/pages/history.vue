<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, isSameMonth, isSameDay, 
  addMonths, subMonths 
} from 'date-fns';
import { ja } from 'date-fns/locale';

const viewMode = ref<'month' | 'week' | 'list' | 'day'>('list');
const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(null);
const searchQuery = ref('');

// Calendar Logic
const calendarDays = computed(() => {
  const start = startOfWeek(startOfMonth(currentDate.value));
  const end = endOfWeek(endOfMonth(currentDate.value));
  return eachDayOfInterval({ start, end });
});

// Weekly Logic
const currentWeekDays = computed(() => {
  const start = startOfWeek(currentDate.value);
  const end = endOfWeek(currentDate.value);
  return eachDayOfInterval({ start, end });
});

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Data Fetching
const { data: journals, refresh } = await useFetch('/api/journals', {
  query: computed(() => {
    // Determine date range based on view mode
    if (viewMode.value === 'week') {
      return {
        startDate: startOfWeek(currentDate.value).toISOString(),
        endDate: endOfWeek(currentDate.value).toISOString(),
        search: searchQuery.value || undefined,
      };
    }
    // Default to month for calendar/list
    return {
      startDate: startOfMonth(currentDate.value).toISOString(),
      endDate: endOfMonth(currentDate.value).toISOString(),
      search: searchQuery.value || undefined,
    };
  }),
});

// Navigation
const prev = () => {
  if (viewMode.value === 'week') {
    currentDate.value = new Date(currentDate.value.setDate(currentDate.value.getDate() - 7));
  } else {
    currentDate.value = subMonths(currentDate.value, 1);
  }
};

const next = () => {
  if (viewMode.value === 'week') {
    currentDate.value = new Date(currentDate.value.setDate(currentDate.value.getDate() + 7));
  } else {
    currentDate.value = addMonths(currentDate.value, 1);
  }
};

const displayDate = computed(() => {
  if (viewMode.value === 'week') {
    const start = startOfWeek(currentDate.value);
    const end = endOfWeek(currentDate.value);
    return `${format(start, 'M月d日', { locale: ja })} - ${format(end, 'M月d日', { locale: ja })}`;
  }
  return format(currentDate.value, 'yyyy年M月', { locale: ja });
});

// Helper to find journals for a specific day
const getJournalsForDay = (day: Date) => {
  if (!journals.value) return [];
  return journals.value.filter(j => j.created_at && isSameDay(new Date(j.created_at), day));
};

const getMoodColor = (mood: number) => {
  if (mood >= 8) return 'bg-blue-500'; // Great
  if (mood >= 5) return 'bg-green-500'; // Normal
  return 'bg-orange-500'; // Bad
};

const getAvgMood = (day: Date) => {
  const logs = getJournalsForDay(day);
  if (!logs.length) return 0;
  const sum = logs.reduce((acc, curr) => acc + (curr.mood_score || 0), 0);
  return sum / logs.length;
};

const selectDay = (day: Date) => {
  selectedDate.value = day;
  viewMode.value = 'day';
};

const selectedDayJournals = computed(() => {
  if (!selectedDate.value) return [];
  return getJournalsForDay(selectedDate.value);
});
</script>

<template>
  <div :class="$style.page">
    <header :class="$style.header">
      <h1 :class="$style.title">{{ $t('history.title') }}</h1>
      
      <div :class="$style.controls">
        <div :class="$style.tabs">
          <button
            @click="viewMode = 'list'"
            :class="[$style.tab, viewMode === 'list' && $style.activeTab]"
          >{{ $t('history.tabs.list') }}</button>
          <button
            @click="viewMode = 'week'"
            :class="[$style.tab, viewMode === 'week' && $style.activeTab]"
          >{{ $t('history.tabs.week') }}</button>
          <button
            @click="viewMode = 'month'"
            :class="[$style.tab, viewMode === 'month' && $style.activeTab]"
          >{{ $t('history.tabs.month') }}</button>
        </div>

        <div :class="$style.monthNav" v-if="viewMode !== 'list' && viewMode !== 'day'">
          <button @click="prev" :class="$style.navBtn">&lt;</button>
          <span :class="$style.currentMonth">{{ displayDate }}</span>
          <button @click="next" :class="$style.navBtn">&gt;</button>
        </div>
      </div>

      <!-- Search Bar -->
      <div :class="$style.searchBar">
        <div :class="$style.searchInputWrapper">
          <input
            v-model.debounce.500ms="searchQuery"
            type="text"
            :placeholder="$t('history.search.placeholder')"
            :class="$style.searchInput"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            :class="$style.clearBtn"
            title="Clear search"
          >✕</button>
        </div>
        <div v-if="searchQuery" :class="$style.searchStatus">
          {{ $t('history.search.results', { count: journals?.length || 0 }) }}
        </div>
      </div>
    </header>

    <!-- Calendar View -->
    <div v-if="viewMode === 'month'" :class="$style.calendar">
      <div :class="$style.weekDays">
        <div v-for="day in weekDays" :key="day" :class="$style.weekDay">{{ day }}</div>
      </div>
      <div :class="$style.days">
        <div 
          v-for="day in calendarDays" 
          :key="day.toString()"
          :class="[$style.day, !isSameMonth(day, currentDate) && $style.otherMonth]"
          @click="selectDay(day)"
        >
          <span :class="$style.dayNumber">{{ format(day, 'd') }}</span>
          
          <div :class="$style.dots">
            <div 
              v-for="j in getJournalsForDay(day)" 
              :key="j.id"
              :class="[$style.dot, j.mood_score && getMoodColor(j.mood_score)]"
              :title="j.content"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly View -->
    <div v-else-if="viewMode === 'week'" :class="$style.weekly">
      <div :class="$style.chartContainer">
        <div v-for="day in currentWeekDays" :key="day.toString()" :class="$style.chartBarCol">
          <div :class="$style.chartBarTrack">
            <div 
              :class="[$style.chartBar, getMoodColor(getAvgMood(day))]" 
              :style="{ height: `${getAvgMood(day) * 10}%` }"
              v-if="getAvgMood(day) > 0"
            ></div>
          </div>
          <span :class="$style.chartLabel">{{ format(day, 'E', { locale: ja }) }}</span>
        </div>
      </div>

      <div :class="$style.list">
         <JournalCard 
          v-for="journal in journals" 
          :key="journal.id" 
          :journal="journal" 
        />
        <div v-if="!journals?.length" :class="$style.empty">
          {{ $t('history.empty.week') }}
        </div>
      </div>
    </div>

    <!-- Day View -->
    <div v-else-if="viewMode === 'day' && selectedDate" :class="$style.list">
      <div :class="$style.dayHeader">
        <button @click="viewMode = 'month'" :class="$style.backBtn">← {{ $t('history.backToMonth') }}</button>
        <h2>{{ format(selectedDate, 'yyyy年M月d日', { locale: ja }) }}</h2>
      </div>

      <div v-if="!selectedDayJournals.length" :class="$style.empty">
        {{ $t('history.empty.day') }}
      </div>
      <JournalCard 
        v-for="journal in selectedDayJournals" 
        :key="journal.id" 
        :journal="journal" 
      />
    </div>

    <!-- List View -->
    <div v-else :class="$style.list">
      <div v-if="!journals?.length" :class="$style.empty">
        {{ $t('history.empty.general') }}
      </div>
      <JournalCard 
        v-for="journal in journals" 
        :key="journal.id" 
        :journal="journal" 
      />
    </div>
  </div>
</template>

<style module>
.page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.title {
  font-size: 1.8rem;
  color: #2d3748;
  margin: 0;
}

.searchBar {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.searchInputWrapper {
  position: relative;
  width: 100%;
}

.searchInput {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem; /* Space for clear button */
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.searchInput:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.clearBtn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  font-size: 0.9rem;
  border-radius: 50%;
}

.clearBtn:hover {
  background: #f1f5f9;
  color: #64748b;
}

.searchStatus {
  font-size: 0.85rem;
  color: #64748b;
  margin-left: 0.5rem;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.tabs {
  display: flex;
  background: #e2e8f0;
  padding: 0.25rem;
  border-radius: 8px;
}

.tab {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s;
}

.activeTab {
  background: white;
  color: #3b82f6;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.monthNav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navBtn {
  background: white;
  border: 1px solid #e2e8f0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.currentMonth {
  font-weight: bold;
  color: #2d3748;
  min-width: 120px;
  text-align: center;
}

/* Calendar Grid */
.calendar {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 1.5rem;
}

.weekDays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 600;
  color: #94a3b8;
  font-size: 0.9rem;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.day {
  aspect-ratio: 1;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
  cursor: pointer;
}

.day:hover {
  background: #f8fafc;
}

.otherMonth {
  background: #f8fafc;
  color: #cbd5e0;
}

.dayNumber {
  font-size: 0.9rem;
  font-weight: 500;
}

.dots {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* Utility classes for dot colors (using global CSS or style module composition would be better, but inline for now) */
:global(.bg-blue-500) { background-color: #3b82f6; }
:global(.bg-green-500) { background-color: #22c55e; }
:global(.bg-orange-500) { background-color: #f97316; }

/* List View */
.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty {
  text-align: center;
  color: #94a3b8;
  padding: 3rem;
  background: white;
  border-radius: 12px;
}

.dayHeader {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.dayHeader h2 {
  font-size: 1.5rem;
  color: #2d3748;
  margin: 0;
}

.backBtn {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  font-size: 0.9rem;
}

.backBtn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

/* Weekly View */
.weekly {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.chartContainer {
  display: flex;
  justify-content: space-around;
  height: 150px;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  align-items: flex-end;
}

.chartBarCol {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  height: 100%;
  width: 100%;
}

.chartBarTrack {
  flex: 1;
  width: 12px;
  background: #f1f5f9;
  border-radius: 6px;
  display: flex;
  align-items: flex-end;
  position: relative;
}

.chartBar {
  width: 100%;
  border-radius: 6px;
  min-height: 4px; /* Ensure visibility for low mood */
  transition: height 0.3s ease;
}

.chartLabel {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}
</style>
