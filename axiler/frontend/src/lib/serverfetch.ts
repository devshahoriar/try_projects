/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import "@/styles/globals.css";

import axiosClient from "@/lib/axiosClient";
import type { User } from "@/lib/types";
import { cookies } from "next/headers";
import { cache } from "react";
export const getCurrentUser = cache(async () => {
  try {
    const c = await cookies();

    const cookieHeader = c
      .getAll()
      .map((x) => `${x.name}=${x.value}`)
      .join("; ");
    const r = await axiosClient.get("/auth/me", {
      headers: {
        Cookie: cookieHeader,
      },
    });
    return r.data as User;
  } catch (error) {
    return null;
  }
});
