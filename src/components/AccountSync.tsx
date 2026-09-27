"use client";

import { useEffect } from "react";
import { bootstrapAccount } from "@/lib/account";

export function AccountSync() {
  useEffect(() => {
    void bootstrapAccount();
  }, []);

  return null;
}
