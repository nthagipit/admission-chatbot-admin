import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DependencyList,
} from "react";
import { getErrorMessage } from "@/utils/api-error";

/**
 * Tải dữ liệu với loading / error / retry.
 * - `reload()`: hiện loading (dùng cho nút Retry).
 * - `refresh()`: tải lại im lặng, giữ dữ liệu cũ (dùng cho polling / sau khi thao tác).
 * Dữ liệu cũ được giữ trong lúc tải lại để bảng không bị nháy.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList,
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  const requestId = useRef(0);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const run = useCallback(async (silent: boolean) => {
    const id = ++requestId.current;
    if (!silent) setLoading(true);
    try {
      const result = await fetcherRef.current();
      if (id !== requestId.current) return;
      setData(result);
      setError(null);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(getErrorMessage(err));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void run(false);
    }, 0);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const reload = useCallback(() => run(false), [run]);
  const refresh = useCallback(() => run(true), [run]);

  return { data, error, loading, reload, refresh };
}
