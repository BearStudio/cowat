import type { ReactNode } from "react";

import { Center, Spinner } from "@chakra-ui/react";
import type { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  Page,
  PageBottomBar,
  PageContent,
  PageTopBar,
} from "@/components/Page";
import type { PageProps } from "@/components/Page";
import { ErrorPage } from "@/components/ErrorPage";
import { BottomNavBar } from "@/components/BottomNavBar";

export const LayoutAuthenticated = ({
  access = "USER",
  children,
  topBar,
  hideNav,
  containerSize,
}: {
  children?: ReactNode;
  access?: "PUBLIC" | UserRole;
  topBar?: ReactNode;
  hideNav?: boolean;
  containerSize?: PageProps["containerSize"];
}) => {
  const router = useRouter();
  const { status, data: session } = useSession();

  if (status === "loading") {
    return (
      <Center flex={1}>
        <Spinner />
      </Center>
    );
  }

  if (status === "unauthenticated") {
    router.replace("/login");
    return null;
  }

  return (
    <Page containerSize={containerSize}>
      {topBar && <PageTopBar>{topBar}</PageTopBar>}
      <PageContent>
        {access === "ADMIN" && session?.user?.role !== "ADMIN" ? (
          <ErrorPage errorCode={404} />
        ) : (
          children
        )}
      </PageContent>
      {!hideNav && (
        <PageBottomBar>
          <BottomNavBar />
        </PageBottomBar>
      )}
    </Page>
  );
};
