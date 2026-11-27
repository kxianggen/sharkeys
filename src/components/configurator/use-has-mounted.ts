"use client";

import { useEffect, useState } from "react";

// Flips to true just after the first client render. Disabled-state props are
// gated on it so the server HTML and the first client render always match.
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setHasMounted(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return hasMounted;
}
