"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function DashboardToastListener() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("deleted") === "1") {
      toast.success("Event deleted successfully");
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  return null;
}