import type { ApiResponse, AuthResponse } from "#shared/types/index.js";
import type { NextFunction, Request, Response } from "express";

import { auth, isValidProvider } from "../providers/better-auth.provider.js";
import {
  OAuthAuthError,
  OAuthAuthService,
} from "../services/oauth-auth.service.js";

export class OAuthController {
  constructor(private oauthAuthService: OAuthAuthService) {}

  getLinkedProviders = async (
    req: Request,
    res: Response<ApiResponse<{ providers: string[] }>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as Request & { user?: { userId: string } }).user
        ?.userId;

      if (!userId) {
        res.status(401).json({
          message: "Authentication required",
          success: false,
        });
        return;
      }

      const providers = await this.oauthAuthService.getLinkedProviders(userId);

      res.status(200).json({
        data: { providers },
        message: "Linked providers retrieved successfully",
        success: true,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Issue JWT tokens after Better Auth completes OAuth authentication.
   * The frontend calls this endpoint after the OAuth callback redirects back.
   * Better Auth has already created/authenticated the user at this point.
   */
  issueTokens = async (
    req: Request<{ provider: string }>,
    res: Response<ApiResponse<AuthResponse>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { provider } = req.params;

      if (!isValidProvider(provider)) {
        res.status(400).json({
          message: `Invalid OAuth provider: ${provider}`,
          success: false,
        });
        return;
      }

      // Get session from Better Auth (from cookies or authorization header)
      // Convert Express headers to Headers format expected by Better Auth
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === "string") {
          headers.set(key, value);
        } else if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v));
        }
      }

      const session = await auth.api.getSession({ headers });

      if (!session?.user) {
        res.status(401).json({
          message: "No active OAuth session. Please complete OAuth flow first.",
          success: false,
        });
        return;
      }

      // Get our JWT tokens for this user
      const result = await this.oauthAuthService.issueTokensForUser(
        session.user.id,
        provider
      );

      res.status(200).json({
        data: result,
        message: "OAuth authentication successful",
        success: true,
      });
    } catch (error) {
      if (error instanceof OAuthAuthError) {
        const statusCode = this.getStatusCodeForError(error.code);
        res.status(statusCode).json({
          message: error.message,
          success: false,
        });
        return;
      }

      next(error);
    }
  };

  unlinkProvider = async (
    req: Request<{ provider: string }>,
    res: Response<ApiResponse<void>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { provider } = req.params;
      const userId = (req as Request & { user?: { userId: string } }).user
        ?.userId;

      if (!userId) {
        res.status(401).json({
          message: "Authentication required",
          success: false,
        });
        return;
      }

      if (!isValidProvider(provider)) {
        res.status(400).json({
          message: `Invalid OAuth provider: ${provider}`,
          success: false,
        });
        return;
      }

      await this.oauthAuthService.unlinkProvider(userId, provider);

      res.status(200).json({
        message: `${provider} account unlinked successfully`,
        success: true,
      });
    } catch (error) {
      if (error instanceof OAuthAuthError) {
        const statusCode = this.getStatusCodeForError(error.code);
        res.status(statusCode).json({
          message: error.message,
          success: false,
        });
        return;
      }

      next(error);
    }
  };

  private getStatusCodeForError(code: string): number {
    switch (code) {
      case "CANNOT_UNLINK_ONLY_AUTH":
        return 400;
      case "OAUTH_ACCOUNT_LINKED":
        return 409;
      case "PROFILE_NOT_FOUND":
      case "USER_NOT_FOUND":
        return 404;
      default:
        return 400;
    }
  }
}
