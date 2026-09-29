"use client";

import React, { useEffect } from "react";
import { useOmniStore } from "@/lib/store/useOmniStore";
import { LoginModal } from "@/components/auth/LoginModal";

export function OmniProvider({ children }: { children: React.ReactNode }) {
  const initialize = useOmniStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      {children}
      <LoginModal />
    </>
  );
}
