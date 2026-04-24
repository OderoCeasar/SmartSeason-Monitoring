import { useEffect, useState } from 'react';

import { getDashboard } from '../api/dashboard';

const initialDashboard = {
  total_fields: 0,
  by_status: {
    active: 0,
    at_risk: 0,
    completed: 0,
  },
  by_stage: {
    planted: 0,
    growing: 0,
    ready: 0,
    harvested: 0,
  },
  recent_updates: [],
  at_risk_fields: [],
};

export function useDashboard() {
  const [data, setData] = useState(initialDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const response = await getDashboard();

        if (!isMounted) {
          return;
        }

        setData({
          ...initialDashboard,
          ...response,
        });
      } catch (requestError) {
        if (isMounted) {
          setError(requestError);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  function refresh() {
    setRefreshKey((value) => value + 1);
  }

  return {
    data,
    loading,
    error,
    refresh,
  };
}
