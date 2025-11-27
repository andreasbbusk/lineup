"use server";

import { apiClient } from "../client";
import {
  AuthResponse,
  LoginRequest,
  ProfileUpdateRequest,
  SignupRequest,
  UserProfile,
} from "../../types/api-types";

interface AvailabilityResponse {
  available: boolean;
}

export async function signup(data: SignupRequest): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/auth/signup", data);
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const loginData: LoginRequest = { email, password };
  return apiClient.post<AuthResponse>("/auth/login", loginData);
}

export async function updateProfile(
  username: string,
  data: ProfileUpdateRequest
): Promise<UserProfile> {
  return apiClient.put<UserProfile>(`/users/${username}`, data, {
    requiresAuth: true,
  });
}

export async function getCurrentProfile(
  username: string
): Promise<UserProfile> {
  return apiClient.get<UserProfile>(`/users/${username}`, {
    requiresAuth: true,
  });
}

export async function checkUsernameAvailability(
  username: string
): Promise<AvailabilityResponse> {
  if (!username?.trim()) {
    return { available: false };
  }

  const params = new URLSearchParams({ username });
  return apiClient.get<AvailabilityResponse>(
    `/auth/check-username?${params.toString()}`
  );
}

export async function checkEmailAvailability(
  email: string
): Promise<AvailabilityResponse> {
  if (!email?.trim()) {
    return { available: false };
  }

  const params = new URLSearchParams({ email });
  return apiClient.get<AvailabilityResponse>(
    `/auth/check-email?${params.toString()}`
  );
}
