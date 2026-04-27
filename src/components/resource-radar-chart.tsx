import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { BLOCKS, type BlockId } from "@/lib/resource-radar";

interface ResourceRadarChartProps {
  /** Нормализованный счёт 0–10 по каждому блоку (в порядке BLOCKS) */
  scores: Record<BlockId, number>;
  /** Заголовок над чартом */
  title?: string;
}

export function ResourceRadarChart({
  scores,
  title = "Карта ресурсов",
}: ResourceRadarChartProps) {
  const data = BLOCKS.map((b) => ({
    subject: b.shortLabel,
    value: scores[b.id] ?? 0,
  }));
  const hasData = data.some((d) => d.value > 0);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="eyebrow">{title}</h3>
        {hasData && (
          <span className="rounded-full bg-[var(--surface-strong)] px-2 py-0.5 text-[10px] font-medium text-foreground/70">
            Live
          </span>
        )}
      </div>
      <div className="relative flex-1">
        {!hasData && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <p className="max-w-[12rem] text-center text-[11px] leading-relaxed text-muted-foreground/60">
              Отмечайте утверждения — радар обновится
            </p>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid
              stroke="var(--hairline-strong)"
              strokeDasharray="2 4"
              strokeOpacity={0.6}
            />
            <PolarAngleAxis
              dataKey="subject"
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 11,
                fontWeight: 500,
              }}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 9,
              }}
              tickCount={3}
              axisLine={false}
            />
            <Radar
              name="Профиль"
              dataKey="value"
              stroke="var(--accent)"
              fill="var(--accent)"
              fillOpacity={hasData ? 0.18 : 0.03}
              strokeWidth={2}
              animationDuration={500}
              animationEasing="ease-out"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
