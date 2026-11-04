/// <reference types="vite/client" />
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { AxiosError } from 'axios';
import { router } from '@/routes';
import { QUERY_STALE_TIME } from '@/constants';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { RealtimeSync } from '@/components/common/RealtimeSync';

// ============================================================
// TanStack Query Client
// ============================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME.SHORT,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors — those are the caller's fault
        // (bad input, not found, etc.) and won't succeed on retry.
        if (error instanceof AxiosError && error.response) {
          const status = error.response.status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// ============================================================
// App Root
// ============================================================

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <QueryClientProvider client={queryClient}>
          <RealtimeSync />
          <RouterProvider router={router} />
          {import.meta.env.DEV && (
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
          )}
        </QueryClientProvider>
        
        <RouterProvider router={router} />
        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;