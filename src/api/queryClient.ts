import { QueryClient } from '@tanstack/react-query';

// Tạo và cấu hình React Query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 phút
    },
  },
});

export default queryClient;
