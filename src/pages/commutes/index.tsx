import { api } from "@/utils/api";
import type { NextPage } from "next";
import Link from "next/link";
import { Fragment } from "react";

const CommutesIndex: NextPage = () => {
  const myCommutes = api.commute.myCommute.useQuery();

  return (
    <div>
      <h1>Commutes</h1>
      <Link href="/commutes/new" className="text-brand-800 underline">
        new commute
      </Link>
      {myCommutes.isLoading && <div>Loader</div>}
      {!myCommutes.isLoading && (
        <ul>
          {myCommutes.data?.map((commute) => (
            <Fragment key={commute.id}>
              <p>
                {commute.id} - {commute.seats} - {commute.status}
              </p>
              <div>
                {commute.stopsOnCommutes.map((stop) => (
                  <div key={stop.stop.location?.id}>
                    {stop.stop.location?.address}
                  </div>
                ))}
              </div>
            </Fragment>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CommutesIndex;
