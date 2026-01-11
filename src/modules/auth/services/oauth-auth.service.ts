import type { IndividualProfileRepository } from "#repositories/individual-profile.repository.js";
import type { OAuthIdentityRepository } from "#repositories/oauth-identity.repository.js";
import type { UserRepository } from "#repositories/user.repository.js";
import type { AuthResponse } from "#shared/types/index.js";

import { generateTokens } from "#shared/utils/jwt.js";

import type { OAuthProvider } from "../providers/better-auth.provider.js";

export class OAuthAuthError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = "OAuthAuthError";
  }
}

export class OAuthAuthService {
  constructor(
    private userRepository: UserRepository,
    private oauthIdentityRepository: OAuthIdentityRepository,
    private individualProfileRepository: IndividualProfileRepository
  ) {}

  /**
   * Issue JWT tokens for a user after Better Auth has completed OAuth authentication.
   * Better Auth handles user creation; this method just issues our JWT tokens.
   */
  async issueTokensForUser(
    userId: string,
    provider: OAuthProvider
  ): Promise<AuthResponse> {
    // Verify user exists
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new OAuthAuthError("User not found", "USER_NOT_FOUND");
    }

    // Get user profile
    const profile = await this.individualProfileRepository.findByUserId(userId);

    if (!profile) {
      throw new OAuthAuthError("User profile not found", "PROFILE_NOT_FOUND");
    }

    // Generate our JWT tokens
    const tokens = generateTokens({
      email: user.email,
      userId: user.id,
      userType: user.userType,
    });

    return {
      profile,
      tokens,
      user_id: user.id,
    };
  }

  async getLinkedProviders(userId: string): Promise<string[]> {
    const identities = await this.oauthIdentityRepository.findByUserId(userId);
    return identities.map((identity) => identity.provider);
  }

  async unlinkProvider(userId: string, provider: OAuthProvider): Promise<void> {
    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new OAuthAuthError("User not found", "USER_NOT_FOUND");
    }

    const identities = await this.oauthIdentityRepository.findByUserId(userId);
    const hasPassword = user.password !== null;

    if (!hasPassword && identities.length <= 1) {
      throw new OAuthAuthError(
        "Cannot unlink the only authentication method. Please set a password first.",
        "CANNOT_UNLINK_ONLY_AUTH"
      );
    }

    await this.oauthIdentityRepository.deleteByUserIdAndProvider(
      userId,
      provider
    );
  }
}
