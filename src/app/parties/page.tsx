import React from "react";
import { InferGetStaticPropsType } from "next";
import { GlobalProps } from "@/features/GlobalProps/GlobalProps";
import PartyCard from "@/components/partyCard";

// export const getStaticProps = GlobalProps.getEmptyStaticProps

// type PageProps = InferGetStaticPropsType<typeof getStaticProps>

export default function Party() {
  return (
    <main className="flex flex-col items-center">
      <div className="max-w-screen mx-16 mt-14 flex flex-row flex-wrap justify-center max-sm:mx-4">
        {/* {parties.map((party, idx) => {
          return (
            <div
              key={party.id}
              className="aspect-[10/9] px-4 pb-3 max-md:w-1/2 max-md:px-2 md:w-1/3 lg:w-1/4"
            >
              <PartyCard
                date={party.date}
                cover={party.cover}
                name={party.name}
                publishDate={party.publishDate}
                id={party.id}
                priority={idx <= 7}
              />
            </div>
          )
        })} */}
      </div>
    </main>
  );
}
