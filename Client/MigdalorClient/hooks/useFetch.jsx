import { useState, useEffect, useRef } from "react";

/**
 * Custom hook for fetching data.
 *
 * @param {string} url - The resource URL to fetch.
 * @param {object} [options] - Optional fetch options (method, headers, body, etc.).
 * @param {array} [deps] - Optional dependency array to re‑trigger the fetch.
 * @returns {{ data: any, loading: boolean, error: Error|null }}
 */
function useFetch(url, options = {}, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Abort any in‑flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    fetch(url, { ...options, signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Fetch error: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
      })
      .catch((err) => {
        // Ignore abort errors
        if (err.name !== "AbortError") {
          setError(err);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    // Cleanup on unmount or url/options change
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, JSON.stringify(options), ...deps]);

  return { data, loading, error };
}

export default useFetch;
