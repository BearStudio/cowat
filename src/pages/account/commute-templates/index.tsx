import { CommuteTemplateOverview } from "@/components/CommuteTemplateOverview";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { api } from "@/utils/api";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  HStack,
  IconButton,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ArrowLeft, Car, Pencil, Plus, Trash } from "lucide-react";
import Link from "next/link";

const Commutes = () => {
  const commuteTemplates = api.template.myCommuteTemplates.useQuery();

  return (
    <LayoutAuthenticated
      hideNav
      topBar={
        <HStack>
          <IconButton
            as={Link}
            size="sm"
            aria-label="Go back"
            icon={<Icon icon={ArrowLeft} />}
            href="/account"
          />
          <Heading size="md" flex={1}>
            Commute templates
          </Heading>
          <IconButton
            size="sm"
            variant="primary"
            aria-label="Create location"
            icon={<Icon icon={Plus} />}
            as={Link}
            href="/account/commute-templates/new"
          />
        </HStack>
      }
    >
      <Stack spacing="4" as="main">
        {commuteTemplates.data?.length === 0 && (
          <EmptyState>You have no commute template at the moment.</EmptyState>
        )}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
          {commuteTemplates.data?.map((template, index) => (
            <Card key={template.id}>
              <CardHeader>
                <Text fontSize="lg" fontWeight="bold">
                  Commute {index + 1}
                </Text>
              </CardHeader>
              <CardBody>
                <CommuteTemplateOverview {...template} />
              </CardBody>
              <CardFooter gap="2">
                <Button
                  variant="primary"
                  leftIcon={<Icon icon={Car} />}
                  as={Link}
                  href={`/commutes/new?template=${template.id}`}
                  flex="1"
                >
                  New
                </Button>
                <Button
                  isDisabled
                  variant="default"
                  leftIcon={<Icon icon={Pencil} />}
                  flex="1"
                >
                  Edit
                </Button>
                <Button
                  isDisabled
                  variant="danger"
                  leftIcon={<Icon icon={Trash} />}
                  flex="1"
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </LayoutAuthenticated>
  );
};

export default Commutes;
