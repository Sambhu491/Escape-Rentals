import { useEffect, useRef } from "react";

// The backend never pushes changes to an open tab — if a host confirms a
// booking, an admin resolves a report, etc. from a different tab/session,
// this tab's Redux state only reflects it once something re-runs the same
// fetch that ran on mount. Re-running it when the tab regains focus or
// becomes visible again covers the common real case (switched away, the
// other action happened, switched back) without polling in the background.
//
// Usage: useRefetchOnFocus(() => dispatch(fetchThing(params)));
// Pass the exact same dispatch call already used in the mount effect.
const useRefetchOnFocus = (refetch) => {
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  useEffect(() => {
    const handleRefetch = () => {
      if (document.visibilityState === "visible") {
        refetchRef.current();
      }
    };

    window.addEventListener("focus", handleRefetch);
    document.addEventListener("visibilitychange", handleRefetch);

    return () => {
      window.removeEventListener("focus", handleRefetch);
      document.removeEventListener("visibilitychange", handleRefetch);
    };
  }, []);
};

export default useRefetchOnFocus;
