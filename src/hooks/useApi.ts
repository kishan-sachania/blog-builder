'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/axios';
import { usePagination } from './usePagination';

export function useApi<T = any>(initialUrl?: string, autoFetch: boolean = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(autoFetch && initialUrl));
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async (method: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string, body?: any) => {
      setLoading(true);
      setError(null);
      try {
        const res = await (method === 'get' || method === 'delete'
          ? apiClient[method](url)
          : apiClient[method](url, body));
        const resData = res.data?.data !== undefined ? res.data.data : res.data;
        setData(resData);
        return resData;
      } catch (err: any) {
        const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Something went wrong';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const get = useCallback((url?: string) => request('get', url || initialUrl || ''), [request, initialUrl]);
  const post = useCallback((url: string, body?: any) => request('post', url, body), [request]);
  const put = useCallback((url: string, body?: any) => request('put', url, body), [request]);
  const patch = useCallback((url: string, body?: any) => request('patch', url, body), [request]);
  const del = useCallback((url: string) => request('delete', url), [request]);

  useEffect(() => {
    if (autoFetch && initialUrl) {
      get(initialUrl).catch(() => {});
    }
  }, [autoFetch, initialUrl, get]);

  return {
    data,
    loading,
    error,
    get,
    post,
    put,
    patch,
    del,
    delete: del,
    setData,
    refetch: () => (initialUrl ? get(initialUrl) : undefined),
  };
}

export function usePaginatedData<T = any>(
  url: string,
  defaultLimit: number = 10,
  initialFilters: Record<string, any> = {}
) {
  const pagination = usePagination(1, defaultLimit);
  const { page, limit, setTotal } = pagination;

  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const filterString = JSON.stringify(filters);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parsedFilters = filterString ? JSON.parse(filterString) : {};
      const res = await apiClient.get(url, {
        params: { page, limit, ...parsedFilters },
      });
      const resData = res.data?.data !== undefined ? res.data.data : res.data;
      if (Array.isArray(resData)) {
        setData(resData);
        setTotal(resData.length);
      } else {
        setData(resData?.items || resData?.blogs || resData?.posts || resData?.users || []);
        setTotal(resData?.total || 0);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [url, page, limit, filterString, setTotal]);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const parsedFilters = filterString ? JSON.parse(filterString) : {};
        const res = await apiClient.get(url, {
          params: { page, limit, ...parsedFilters },
        });
        const resData = res.data?.data !== undefined ? res.data.data : res.data;
        if (!ignore) {
          if (Array.isArray(resData)) {
            setData(resData);
            setTotal(resData.length);
          } else {
            setData(resData?.items || resData?.blogs || resData?.posts || resData?.users || []);
            setTotal(resData?.total || 0);
          }
        }
      } catch (err: any) {
        if (!ignore) {
          setError(err.response?.data?.message || err.message || 'Failed to fetch data');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [url, page, limit, filterString, setTotal]);

  return {
    data,
    loading,
    error,
    filters,
    setFilters,
    ...pagination,
    refetch: fetchData,
  };
}

export const getPaginatedData = usePaginatedData;
