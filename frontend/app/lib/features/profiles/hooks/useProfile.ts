"use client";

import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../api';

export function useProfile(username: string) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: () => getUserProfile(username),
    staleTime: 5 * 60 * 1000,
  });
}
