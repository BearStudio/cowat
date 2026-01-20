import Chart from "@/components/Chart";
import { Flex, Stack, Text } from "@chakra-ui/react";

type ChartData = {
  year: number;
  value: number;
  actualYear?: boolean;
};

interface ChartProps {
  chartData: ChartData[];
  allTimeData: number | undefined;
  thisYearData: number | undefined;
  label: string;
}

export const ChatWithStats = ({
  label,
  allTimeData,
  thisYearData,
  chartData,
}: ChartProps) => {
  return (
    <Stack
      spacing="4"
      boxShadow="card"
      p="4"
      bg="white"
      rounded="md"
      _dark={{
        bg: "gray.800",
      }}
    >
      <Text fontSize="lg" fontWeight="medium">
        {label}
      </Text>
      <Flex gap={8}>
        <Flex direction="column" alignItems="center">
          <Text fontSize="sm">All time</Text>
          <Text fontSize="lg" fontWeight="medium">
            {allTimeData}
          </Text>
        </Flex>
        <Flex direction="column" alignItems="center">
          <Text fontSize="sm">This year</Text>
          <Text fontSize="lg" fontWeight="medium">
            {thisYearData}
          </Text>
        </Flex>
      </Flex>
      <Chart data={chartData || []} />
    </Stack>
  );
};
