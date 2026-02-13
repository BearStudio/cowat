import { BottomNavBar } from "@/components/BottomNavBar";
import { ErrorPage } from "@/components/ErrorPage";
import { Page, PageBottomBar, PageContent } from "@/components/Page";

const Page404 = () => {
  return (
    <Page>
      You've reached an error.
      <PageContent>
        <ErrorPage errorCode={404} />
      </PageContent>
      <PageBottomBar>
        <BottomNavBar />
      </PageBottomBar>
    </Page>
  );
};

export default Page404;
