import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { Heading } from "@chakra-ui/react";

const Dashboard = () => {
  return (
    <LayoutAuthenticated topBar={<Heading>Dashboard</Heading>}>
      Congrats, you are authenticated
    </LayoutAuthenticated>
  );
};

export default Dashboard;
