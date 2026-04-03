import { useEffect, useMemo, useRef } from "react";
import * as echarts from "echarts";
import { Empty } from "antd";

type ThresholdLine = {
  value: number;
  label: string;
  color: string;
};

type LineChartProps = {
  color: string;
  data: Array<{ timestamp: number; value: number }>;
  emptyText: string;
  height?: number;
  thresholds?: ThresholdLine[];
  yAxisFormatter?: (value: number) => string;
};

export function LineChart({
  color,
  data,
  emptyText,
  height = 260,
  thresholds,
  yAxisFormatter,
}: LineChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const seriesData = useMemo(
    () => data.map((item) => [item.timestamp, Number(item.value.toFixed(2))] as [number, number]),
    [data],
  );

  useEffect(() => {
    if (!containerRef.current || seriesData.length === 0) {
      return;
    }

    const chart = echarts.init(containerRef.current);
    chart.setOption({
      animation: false,
      grid: { top: 24, right: 20, bottom: 32, left: 44 },
      tooltip: {
        trigger: "axis",
        formatter: (params: Array<{ data: [number, number] }>) => {
          const [timestamp, value] = params[0].data;
          const dateLabel = new Date(timestamp).toLocaleTimeString();
          const valueLabel = yAxisFormatter ? yAxisFormatter(value) : value.toFixed(2);
          return `${dateLabel}<br/>${valueLabel}`;
        },
      },
      xAxis: {
        type: "time",
        axisLabel: { color: "#94a3b8" },
        axisLine: { lineStyle: { color: "#334155" } },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "#94a3b8",
          formatter: (value: number) => (yAxisFormatter ? yAxisFormatter(value) : value.toFixed(0)),
        },
        splitLine: { lineStyle: { color: "#1e293b" } },
      },
      series: [
        {
          type: "line",
          showSymbol: false,
          smooth: true,
          lineStyle: { width: 2, color },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${color}99` },
              { offset: 1, color: `${color}0d` },
            ]),
          },
          data: seriesData,
          markLine: thresholds?.length
            ? {
                symbol: "none",
                label: { color: "#cbd5e1" },
                lineStyle: { type: "dashed" },
                data: thresholds.map((threshold) => ({
                  yAxis: threshold.value,
                  name: threshold.label,
                  lineStyle: { color: threshold.color },
                  label: { formatter: `${threshold.label}: ${threshold.value}` },
                })),
              }
            : undefined,
        },
      ],
    });

    const resizeChart = () => chart.resize();
    window.addEventListener("resize", resizeChart);

    return () => {
      window.removeEventListener("resize", resizeChart);
      chart.dispose();
    };
  }, [color, seriesData, thresholds, yAxisFormatter]);

  if (seriesData.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/60"
        style={{ height }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span className="text-slate-400">{emptyText}</span>}
        />
      </div>
    );
  }

  return <div ref={containerRef} style={{ height, width: "100%" }} />;
}
