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



const chartData = computed(() => {
  if (props.data.length === 0) return { labels: [], datasets: [] };

  const dates = props.data.map(d => parseISO(d.date));
  const minDate = min(dates);
  const maxDate = max(dates);

  const allDates = eachDayOfInterval({ start: minDate, end: maxDate });

  // Map for quick lookup
  const dataMap = new Map(props.data.map(d => [d.date, d.score]));

  return {
    labels: allDates.map(d => format(d, 'MM/dd')),
    datasets: [{
      label: 'Mood Score',
      data: allDates.map(d => {
        const key = format(d, 'yyyy-MM-dd');
        return dataMap.get(key) ?? null;
      }),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
