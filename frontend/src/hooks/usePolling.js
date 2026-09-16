import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Polls an async fetcher every `interval` ms so dashboards stay near-real-time
 * without needing a websocket server. Pauses when the tab is hidden.
 */
export function usePolling(fetcher, interval = 4000, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const timer = useRef(null);

  const run = useCallback(async () => {
    try {
      const result = await fetcher();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    run();
    function tick() {
      if (document.visibilityState === "visible") run();
      timer.current = setTimeout(tick, interval);
    }
    timer.current = setTimeout(tick, interval);
    return () => clearTimeout(timer.current);
  }, [run, interval]);

  return { data, error, loading, refresh: run };
}
