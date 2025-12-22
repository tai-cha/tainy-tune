<script setup lang="ts">
import { Line } from 'vue-chartjs';
import { eachDayOfInterval, format, parseISO, min, max } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const props = defineProps<{
  data: {
    date: string;
    score: number;
  }[];
}>();



const getStyle = (name: string) => {
  if (import.meta.client) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  return '#3b82f6';
};

const chartData = computed(() => {
  if (props.data.length === 0) return { labels: [], datasets: [] };

  const dates = props.data.map(d => parseISO(d.date));
  const minDate = min(dates);
  const maxDate = max(dates);

  const allDates = eachDayOfInterval({ start: minDate, end: maxDate });

  // Map for quick lookup
  const dataMap = new Map(props.data.map(d => [d.date, d.score]));

  // Use Primary color for the trend line
  const primary = getStyle('--color-primary');

  return {
    labels: allDates.map(d => format(d, 'MM/dd')),
    datasets: [{
      label: 'Mood Score',
      data: allDates.map(d => {
        const key = format(d, 'yyyy-MM-dd');
        return dataMap.get(key) ?? null;
      }),
      borderColor: primary,
      backgroundColor: primary + '1A', // 10% opacity (approx if hex) - simplified
      tension: 0.3,
      fill: true,
      spanGaps: true, // Connect lines across gaps (optional, remove if gaps preferred)
    }]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      min: 0,
      max: 10,
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
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style module>
.container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>
