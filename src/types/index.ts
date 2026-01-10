import type { User } from "#db/schema/users.js";

export interface ApiResponse<T = unknown> {
  data?: T;
  errors?: Record<string, string[]>;
  message: string;
  success: boolean;
}

export interface AuthResponse {
  tokens: AuthTokens;
  user: Omit<User, "password">;
}

export interface AuthTokenPayload {
  email: string;
  userId: string;
  userType: UserType;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterIndividualInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
  termsAccepted: boolean;
}

export type UserType = "individual" | "logistics_company" | "rider";

