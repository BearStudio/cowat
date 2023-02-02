import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { Button, Heading } from "@chakra-ui/react";
import { signOut } from "next-auth/react";

const AccountPage = () => {
  return (
    <LayoutAuthenticated topBar={<Heading>Account</Heading>}>
      <Button onClick={() => signOut()}>Log out</Button>
    </LayoutAuthenticated>
  );
};

export default AccountPage;
