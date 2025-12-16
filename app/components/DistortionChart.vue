<script setup lang="ts">
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const props = defineProps<{
  counts: Record<string, number>;
}>();

const { t, te } = useI18n();

const chartData = computed(() => {
  // Sort by count desc
  const sortedEntries = Object.entries(props.counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Top 10

  return {
    labels: sortedEntries.map(([key]) => {
      // If key matches a distortion ID, translate it. Otherwise use the key (for Japanese raw data).
      const k = `distortions.${key}`;
      return te(k) ? t(k) : key;
    }),
    datasets: [{
      label: 'Count',
      data: sortedEntries.map(([, count]) => count),
      backgroundColor: '#f87171',
      borderRadius: 4,
    }]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const, // Horizontal bar
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  },
  plugins: {
    legend: {
      display: false
    }
  }
};
</script>

<template>
  <div :class="$style.container">
    <Bar :data="chartData" :options="chartOptions" v-if="Object.keys(counts).length > 0" />
    <div v-else :class="$style.empty">
      No data available
    </div>
  </div>
</template>

<style module>
.container {
  position: relative;
  height: 400px;
  /* Taller for horizontal bars */
  width: 100%;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
}
</style>
