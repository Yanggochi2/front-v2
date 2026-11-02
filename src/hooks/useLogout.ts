"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toErrorMessage } from "@/lib/apiErrorMessage";
import { logout } from "@/services/authApi";

export function useLogout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } catch (e) {
      setError(toErrorMessage(e));
      setLoading(false);
    }
  }

  return { run, loading, error };
}
