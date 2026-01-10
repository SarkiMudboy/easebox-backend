import type { AuthTokenPayload, AuthTokens } from "#types/index.js";

import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET ?? "access-secret-change-in-production";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET ?? "refresh-secret-change-in-production";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export function generateTokens(payload: AuthTokenPayload): AuthTokens {
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

