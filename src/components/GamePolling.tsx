"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface GamePollingProps {
  /** Polling interval in milliseconds */
  intervalMs?: number;
}

export default function GamePolling({ intervalMs = 5000 }: GamePollingProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [router, intervalMs]);

  return null;
}
