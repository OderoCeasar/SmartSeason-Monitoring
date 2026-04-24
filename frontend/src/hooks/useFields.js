import { useEffect, useMemo, useState } from 'react';

import {
  assignField,
  createField,
  deleteField,
  getFieldById,
  getFields,
  getUsers,
  updateField,
} from '../api/fields';
import { createFieldUpdate, getFieldUpdates } from '../api/updates';

const defaultAgentParams = { role: 'field_agent' };

const initialListState = {
  items: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  },
};

export function useFields(initialParams = {}) {
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    ...initialParams,
  });
  const [data, setData] = useState(initialListState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadFields() {
      setLoading(true);
      setError(null);

      try {
        const response = await getFields(params);

        if (!isMounted) {
          return;
        }

        setData({
          items: response.items || [],
          pagination: response.pagination || initialListState.pagination,
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

    loadFields();

    return () => {
      isMounted = false;
    };
  }, [params, refreshKey]);

  function updateParams(nextParams) {
    setParams((current) => ({
      ...current,
      ...nextParams,
    }));
  }

  function refresh() {
    setRefreshKey((value) => value + 1);
  }

  return {
    ...data,
    params,
    loading,
    error,
    setParams: updateParams,
    refresh,
  };
}

export function useFieldDetail(fieldId, initialUpdateParams = { page: 1, limit: 10 }) {
  const [field, setField] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [pagination, setPagination] = useState({
    page: initialUpdateParams.page || 1,
    limit: initialUpdateParams.limit || 10,
    total: 0,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateParams, setUpdateParams] = useState(initialUpdateParams);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!fieldId) {
      setLoading(false);
      return undefined;
    }

    let isMounted = true;

    async function loadFieldDetail() {
      setLoading(true);
      setError(null);

      try {
        const [fieldResponse, updatesResponse] = await Promise.all([
          getFieldById(fieldId),
          getFieldUpdates(fieldId, updateParams),
        ]);

        if (!isMounted) {
          return;
        }

        setField(fieldResponse.item || null);
        setUpdates(updatesResponse.items || []);
        setPagination(
          updatesResponse.pagination || {
            page: initialUpdateParams.page || 1,
            limit: initialUpdateParams.limit || 10,
            total: 0,
            pages: 1,
          }
        );
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

    loadFieldDetail();

    return () => {
      isMounted = false;
    };
  }, [fieldId, updateParams, refreshKey]);

  function refresh() {
    setRefreshKey((value) => value + 1);
  }

  return {
    field,
    updates,
    pagination,
    loading,
    error,
    setUpdateParams,
    refresh,
  };
}

export function useFieldActions() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function runAction(action) {
    setSubmitting(true);
    setError(null);

    try {
      return await action();
    } catch (requestError) {
      setError(requestError);
      throw requestError;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    submitting,
    error,
    createField: (payload) => runAction(() => createField(payload)),
    updateField: (fieldId, payload) => runAction(() => updateField(fieldId, payload)),
    deleteField: (fieldId) => runAction(() => deleteField(fieldId)),
    assignField: (fieldId, payload) => runAction(() => assignField(fieldId, payload)),
    createFieldUpdate: (fieldId, payload) => runAction(() => createFieldUpdate(fieldId, payload)),
  };
}

export function useAgents(params = defaultAgentParams) {
  const requestParams = useMemo(() => params, [JSON.stringify(params)]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAgents() {
      setLoading(true);
      setError(null);

      try {
        const response = await getUsers(requestParams);

        if (!isMounted) {
          return;
        }

        setAgents(response.items || []);
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

    loadAgents();

    return () => {
      isMounted = false;
    };
  }, [requestParams]);

  return {
    agents,
    loading,
    error,
  };
}
