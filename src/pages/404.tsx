import { BottomNavBar } from "@/components/BottomNavBar";
import { ErrorPage } from "@/components/ErrorPage";
import { Page, PageBottomBar, PageContent } from "@/components/Page";

const Page404 = () => {
  return (
    <Page>
      <p>You've reached an error.</p>
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
