"use server";

import { apiClient } from "../client";
import {
  AuthResponse,
  LoginRequest,
  ProfileUpdateRequest,
  SignupRequest,
  UserProfile,
} from "../../types/api-types";

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
