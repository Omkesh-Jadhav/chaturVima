/**
 * Custom hook to lock/unlock body scroll
 */

import { useEffect } from "react";

export const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (typeof document === "undefined" || !isLocked) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLocked]);
};

