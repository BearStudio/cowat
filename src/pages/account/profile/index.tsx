import { FieldInput } from "@/components/FieldInput";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import type { RouterInputs } from "@/utils/api";
import { api } from "@/utils/api";
import { Button, Center, Heading, Spinner, Stack } from "@chakra-ui/react";
import { Formiz } from "@formiz/core";
import { useRouter } from "next/router";

type UpdateProfileInput = RouterInputs["user"]["updateProfile"];

const ProfilePage = () => {
  const ctx = api.useContext();
  const router = useRouter();

  const profileMutation = api.user.updateProfile.useMutation();
  const profile = api.user.profile.useQuery();

  return (
    <LayoutAuthenticated topBar={<Heading size="md">Profile</Heading>}>
      {profile.isLoading && (
        <Center flex={1}>
          <Spinner />
        </Center>
      )}
      {profile.data && (
        <Stack
          spacing="4"
          as="main"
          boxShadow="card"
          p="4"
          bg="white"
          rounded="md"
        >
          <Formiz
            autoForm
            onValidSubmit={(values: UpdateProfileInput) =>
              profileMutation.mutate(values, {
                onSuccess: () => {
                  ctx.user.profile.invalidate();
                  router.push("/account");
                },
              })
            }
            initialValues={profile.data}
          >
            <Stack>
              <FieldInput
                name="phone"
                label="Phone number"
                placeholder="0600112233"
              />
              <Button
                variant="primary"
                type="submit"
                isLoading={profileMutation.isLoading}
              >
                Save
              </Button>
            </Stack>
          </Formiz>
        </Stack>
      )}
    </LayoutAuthenticated>
  );
};

export default ProfilePage;
