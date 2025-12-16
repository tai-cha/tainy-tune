<script setup lang="ts">
import { Line } from 'vue-chartjs';
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

const chartData = computed(() => ({
  labels: props.data.map(d => d.date.slice(5)), // MM-DD
  datasets: [{
    label: 'Mood Score',
    data: props.data.map(d => d.score),
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    tension: 0.3,
    fill: true,
  }]
}));

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
