import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables, ChartDataLabels);

function getThemeColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    primary: style.getPropertyValue('--primary').trim(),
    text: style.getPropertyValue('--text').trim(),
    textSecondary: style.getPropertyValue('--text-secondary').trim(),
  };
}

export function BarChart({ data, title, compare, barColor }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const colors = data.map(g => {
      if (barColor) return barColor;
      const pct = (g.nota / 20) * 100;
      return pct >= 50 ? '#27ae60' : pct >= 35 ? '#f39c12' : '#e74c3c';
    });

    const { primary, text } = getThemeColors();

    const datasets = [
      {
        label: 'Tu nota',
        data: data.map(g => g.nota),
        backgroundColor: colors,
        borderRadius: 6,
      },
    ];

    if (compare) {
      datasets.push({
        label: 'Promedio',
        data: data.map(g => g.avg || 0),
        backgroundColor: '#2A2C32',
        borderRadius: 6,
      });
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: data.map(g => g.name),
        datasets,
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: !!compare,
            position: 'right',
            align: 'center',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 8,
              padding: 8,
              color: '#E2E8F0',
              font: { size: 11 },
              generateLabels: (chart) => {
                const ds = chart.data.datasets;
                return ds.map((d) => ({
                  text: d.label,
                  fillStyle: Array.isArray(d.backgroundColor) ? d.backgroundColor[0] : d.backgroundColor,
                  strokeStyle: 'transparent',
                  pointStyle: 'circle',
                }));
              },
            },
          },
          title: { display: true, text: title, color: '#E2E8F0' },
          datalabels: {
            display: function(context) {
              return context.dataset.label === 'Tu nota';
            },
            color: '#FFFFFF',
            font: { weight: 'bold', size: 10 },
            anchor: 'end',
            align: 'end',
            offset: 2,
          },
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Nota (0-20)', color: '#E2E8F0' }, ticks: { color: '#8B8E93' } },
          x: { ticks: { color: '#E2E8F0' } },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data, title, compare]);

  return <canvas ref={canvasRef}></canvas>;
}

export function DistributionChart({ data, title, height = 180, color }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = Object.keys(data);
    const values = Object.values(data);
    const maxVal = Math.max(...values, 1);

    const bgColors = values.map(v => {
      if (color) return color;
      const pct = v / maxVal;
      if (pct > 0.6) return '#10B981';
      if (pct > 0.3) return '#3B82F6';
      return '#6B7280';
    });

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Alumnos',
          data: values,
          backgroundColor: bgColors,
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: title, color: '#E2E8F0', font: { size: 12 } },
          datalabels: { display: false },
        },
        scales: {
          y: { beginAtZero: true, ticks: { color: '#8B8E93', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
          x: { ticks: { color: '#E2E8F0', font: { size: 9 }, maxRotation: 45 }, grid: { display: false } },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data, title]);

  return <div style={{ height }}><canvas ref={canvasRef}></canvas></div>;
}

export function EvolutionChart({ data }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: data.map(g => g.name),
        datasets: [
          {
            label: 'Tu nota',
            data: data.map(g => g.nota),
            borderColor: '#00F0FF',
            backgroundColor: function(context) {
              if (!context.chart.chartArea) return 'rgba(0, 240, 255, 0.1)';
              const { top, bottom } = context.chart.chartArea;
              const g = context.chart.ctx.createLinearGradient(0, top, 0, bottom);
              g.addColorStop(0, 'rgba(0, 240, 255, 0.1)');
              g.addColorStop(1, 'rgba(0, 240, 255, 0)');
              return g;
            },
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#00F0FF',
            pointRadius: 5,
          },
          ...(data[0]?.avg !== undefined
            ? [{
                label: 'Promedio',
                data: data.map(g => g.avg),
                borderColor: '#8B8E93',
                backgroundColor: 'transparent',
                fill: false,
                tension: 0.3,
                borderDash: [5, 5],
                pointBackgroundColor: '#8B8E93',
                pointRadius: 4,
              }]
            : []),
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, labels: { color: '#E2E8F0' } },
          title: { display: true, text: 'Evolución de Notas', color: '#E2E8F0' },
          datalabels: { display: false },
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Nota (0-20)', color: '#E2E8F0' }, ticks: { color: '#8B8E93' } },
          x: { ticks: { color: '#E2E8F0' } },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data]);

  return <canvas ref={canvasRef}></canvas>;
}
