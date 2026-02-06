import { BottomNavBar } from "@/components/BottomNavBar";
import { ErrorPage } from "@/components/ErrorPage";
import { Page, PageBottomBar, PageContent } from "@/components/Page";

const Page404 = () => {
  return (
    <Page>
      <PageContent>
        <p>Hello there, checking Vercel preview deployments</p>
        <ErrorPage errorCode={404} />
      </PageContent>

      <PageBottomBar>
        <BottomNavBar />
      </PageBottomBar>
    </Page>
  );
};

export default Page404;
