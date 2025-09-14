import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/axiosClient';
import type { AuthResponse, LoginCredentials, RegisterData } from '@/lib/types';

// Query keys for React Query
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

// Hook to get current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: authApi.getCurrentUser,
    retry: false, // Don't retry on auth failures
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to register a new user
export const useRegister = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (userData: RegisterData) => authApi.register(userData),
    onSuccess: (_data: AuthResponse) => {
      // Invalidate and refetch user data
      void queryClient.invalidateQueries({ queryKey: authKeys.user() });
      
      // Redirect to login page after successful registration
      router.push('/chat');
    },
    onError: (error: Error) => {
      console.error('Registration failed:', error.message);
    },
  });
};

// Hook to login user
export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (_data: AuthResponse) => {
      // Invalidate and refetch user data
      void queryClient.invalidateQueries({ queryKey: authKeys.user() });
      
      // Redirect to chat page after successful login
      router.push('/chat');
    },
    onError: (error: Error) => {
      console.error('Login failed:', error.message);
    },
  });
};

// Hook to logout user
export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      // Redirect to login page
      router.push('/login');
    },
    onError: (error: Error) => {
      console.error('Logout failed:', error.message);
    },
  });
};

// Hook to check if user is authenticated
export const useAuthQuery = () => {
  const { data: user, isLoading, error } = useCurrentUser();
  
  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
  };
};
