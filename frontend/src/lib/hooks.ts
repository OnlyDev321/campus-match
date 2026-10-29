"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toApiErrorCode } from "@/lib/api";
import { useAuthHydrated, useAuthStore } from "@/stores/authStore";
import type { ApiErrorCode, AsyncStatus, ServiceDataState } from "@/lib/types";

/**
 * Yêu cầu đăng nhập trước khi vào trang (cùng cách làm với trang /groups):
 * chưa đăng nhập → mở modal đăng nhập kèm đường dẫn quay lại và chuyển về trang chủ.
 * Trả về true khi đã khôi phục phiên và người dùng đã đăng nhập.
 */
export const useRequireLogin = (redirectTo: string): boolean => {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const { isLoggedIn, isLoading, openLoginModal } = useAuthStore();

  useEffect(() => {
    if (hydrated && !isLoading && !isLoggedIn) {
      openLoginModal(redirectTo);
      router.push("/");
    }
  }, [hydrated, isLoggedIn, isLoading, openLoginModal, redirectTo, router]);

  return hydrated && isLoggedIn;
};

/**
 * Gọi một hàm trong services/ và quản lý trạng thái loading / error / ready.
 * `load` nên được bọc bằng useCallback để không gọi lại mỗi lần render.
 */
export const useServiceData = <T,>(
  load: () => Promise<T>,
  enabled: boolean,
): ServiceDataState<T> => {
  const [status, setStatus] = useState<AsyncStatus>("loading");
  const [data, setDataState] = useState<T | null>(null);
  const [errorCode, setErrorCode] = useState<ApiErrorCode | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    load()
      .then((result) => {
        if (cancelled) return;
        setDataState(result);
        setErrorCode(null);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setErrorCode(toApiErrorCode(error));
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [load, enabled, reloadKey]);

  const reload = useCallback(() => {
    setStatus("loading");
    setReloadKey((key) => key + 1);
  }, []);

  return { status, data, errorCode, reload, setData: setDataState };
};
