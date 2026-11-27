"use client";

import { useEffect } from "react";

import { track } from "@/lib/analytics";

/** Fires `landing_viewed` once when the landing page mounts (v2 WS0). */
export function LandingViewedTracker() {
  useEffect(() => {
    track("landing_viewed");
  }, []);

  return null;
}
