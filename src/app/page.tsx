"use client";

import { useSession } from "next-auth/react";

export default function Page() {
  const { data } = useSession();
  return (
    <div>
      <p>{data?.user?.name}</p>
    </div>
  );
}
