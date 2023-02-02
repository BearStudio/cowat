import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { Heading } from "@chakra-ui/react";

const Dashboard = () => {
  return (
    <LayoutAuthenticated topBar={<Heading>Cowat</Heading>}>
      Hi
    </LayoutAuthenticated>
  );
};

export default Dashboard;
