/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    // Google Charts global object loaded from the loader script.
    google: unknown;
  }
}

interface GoogleChartProps {
  chartType: string;
  data: Array<Array<string | number | null>>;
  options?: Record<string, unknown>;
  width?: string | number;
  height?: string | number;
}

export function GoogleChart({ chartType, data, options, width = "100%", height = 300 }: GoogleChartProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const drawChart = () => {
      const google = (window.google as any);
      if (!google || !ref.current) return;
      const dataTable = google.visualization.arrayToDataTable(data);
      const chart = new google.visualization[chartType](ref.current);
      chart.draw(dataTable, options);
    };

    const loadChart = () => {
      const google = (window.google as any);
      google.charts.load("current", { packages: ["corechart"] });
      google.charts.setOnLoadCallback(drawChart);
    };

    const google = (window.google as any);
    if (!google || !google.charts) {
      const script = document.createElement("script");
      script.src = "https://www.gstatic.com/charts/loader.js";
      script.onload = loadChart;
      document.head.appendChild(script);
    } else {
      loadChart();
    }
  }, [chartType, data, options]);

  return <div ref={ref} style={{ width, height }} />;
}

export default GoogleChart;
