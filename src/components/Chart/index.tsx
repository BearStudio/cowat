import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

type ChartData = {
  year: number;
  value: number;
  actualYear?: boolean;
};

interface ChartProps {
  data: ChartData[];
}

export default function Chart({ data }: ChartProps) {
  const past = data.filter((year) => !year.actualYear);
  const actualYear = data.filter((year) => year.actualYear);

  const years = data.map((year) => year.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  const maxValue = Math.max(...data.map((value) => value.value));

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
