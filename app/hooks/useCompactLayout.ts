"use client";

import { useEffect, useState } from "react";

export function useCompactLayout() {
  const [compactLayout, setCompactLayout] = useState(false);

  useEffect(() => {
    const checkLayout = () => {
      setCompactLayout(window.innerWidth < 1024);
    };

    checkLayout();
    window.addEventListener("resize", checkLayout);

    return () => window.removeEventListener("resize", checkLayout);
  }, []);

  return compactLayout;
}
