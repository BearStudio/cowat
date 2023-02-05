import { CommuteOverview } from "@/components/CommuteOverview";
import { Icon } from "@/components/Icon";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { api } from "@/utils/api";
import { Button, Heading, Stack, Text } from "@chakra-ui/react";
import dayjs from "dayjs";
import { Navigation } from "lucide-react";

const Dashboard = () => {
  const commutesByDate = api.commute.allUpcomingCommutes.useQuery();

  return (
    <LayoutAuthenticated topBar={<Heading>Cowat</Heading>}>
      <Stack spacing="8">
        {commutesByDate.data &&
          Object.keys(commutesByDate.data).map((key) => (
            <Stack key={key}>
              <Text fontSize="lg" fontWeight="bold">
                {key === dayjs().format("YYYY-MM-DD")
                  ? "Today"
                  : dayjs(key).format("dddd DD MMM")}
              </Text>
              {commutesByDate.data[key]?.map((commute) => (
                <CommuteOverview key={commute.id} {...commute} />
              ))}
              {key === dayjs().format("YYYY-MM-DD") && (
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Icon icon={Navigation} />}
                  isDisabled
                >
                  Open driver&apos;s view
                </Button>
              )}
            </Stack>
          ))}
      </Stack>
    </LayoutAuthenticated>
  );
};

export default Dashboard;
