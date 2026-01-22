import Chart from "@/components/ChartByYear";
import { Center, Flex, Stack, Text, Spinner } from "@chakra-ui/react";
import { getUiState } from "@bearstudio/ui-state";
import type { chartDataProps } from "@/utils/stats";

interface ChartProps {
  chartData: chartDataProps[];
  allTimeData: number | undefined;
  thisYearData: number | undefined;
  label: string;
  isLoading: boolean;
  isError: boolean;
}

export const ChartByYearWithStats = ({
  label,
  allTimeData,
  thisYearData,
  chartData,
  isLoading,
  isError,
}: ChartProps) => {
  const isChartEmpty = chartData.every((chart) => chart.value === 0);
  const ui = getUiState((set) => {
    if (isLoading) return set("pending");
    if (isError) return set("error");
    if (!chartData || isChartEmpty) {
      return set("empty");
    }
    return set("default", {
      chartData,
      allTimeData,
      thisYearData,
    });
  });
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
      {ui
        .match("pending", () => (
          <Center>
            <Spinner />
          </Center>
        ))
        .match("empty", () => (
          <Center>
            <Text color="gray.600" _dark={{ color: "gray.300" }}>
              {label === "Commutes"
                ? "You need to create commutes to see statistics here."
                : label === "Booked commutes"
                ? "You need to book commutes to see statistics here."
                : label === "Driven people"
                ? "You need to drive people to see statistics here."
                : undefined}
            </Text>
          </Center>
        ))
        .match("error", () => (
          <Center>
            <Text color="error.500">Error loading data</Text>
          </Center>
        ))
        .match("default", ({ chartData, allTimeData, thisYearData }) => (
          <Stack pr={4}>
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
            <Chart chartData={chartData} />
          </Stack>
        ))
        .exhaustive()}
    </Stack>
  );
};
