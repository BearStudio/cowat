import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

type chartDataProps = {
  year: number;
  value: number;
  actualYear?: boolean;
};

interface ChartProps {
  chartData: chartDataProps[];
}

export default function ChartByYear({ chartData }: ChartProps) {
  const past = chartData.filter((data) => !data.actualYear);
  const actualYear = chartData.filter((data) => data.actualYear);

  const years = chartData.map((data) => data.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  const maxValue = Math.max(...chartData.map((value) => value.value));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart>
        <XAxis
          dataKey="year"
          type="number"
          domain={[minYear, maxYear]}
          ticks={years}
          tickLine={false}
        />
        <YAxis
          domain={[0, maxValue]}
          tickCount={2}
          tickLine={false}
          width={35}
        />

        {/* Past years */}
        <Line
          data={past}
          dataKey="value"
          type="linear"
          strokeWidth={3}
          dot={false}
          activeDot={false}
          isAnimationActive={false}
        />

        {/* Actual year */}
        {past.length > 0 && actualYear.length > 0 && (
          <Line
            data={[past[past.length - 1], ...actualYear]}
            dataKey="value"
            type="linear"
            strokeDasharray="6"
            strokeWidth={3}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
