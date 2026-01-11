import type { User } from "#infrastructure/database/schema/users.js";
import type { IndividualProfileRepository } from "#repositories/individual-profile.repository.js";
import type { UserRepository } from "#repositories/user.repository.js";
import type {
  AuthResponse,
  RegisterIndividualInput,
} from "#shared/types/index.js";

import { generateTokens } from "#shared/utils/jwt.js";
import { hashPassword } from "#shared/utils/password.js";

import type { VerificationService } from "./verification.service.js";

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private individualProfileRepository: IndividualProfileRepository,
    private verificationService: VerificationService
  ) {}

  async registerIndividual(
    input: RegisterIndividualInput
  ): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.existsByEmail(input.email);
    if (existingUser) {
      throw new AuthError(
        "A user with this email already exists",
        "EMAIL_EXISTS"
      );
    }

    // Validate terms acceptance
    if (!input.termsAccepted) {
      throw new AuthError(
        "You must accept the terms and conditions",
        "TERMS_NOT_ACCEPTED"
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(input.password);

    // Create user
    const user = await this.userRepository.create({
      email: input.email.toLowerCase().trim(),
      password: hashedPassword,
      termsAccepted: true,
      userType: "individual",
    });

    // Create individual profile
    const profile = await this.individualProfileRepository.create({
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone?.trim() ?? null,
      userId: user.id,
    });

    // Send verification email (don't block registration on failure)
    try {
      await this.verificationService.sendEmailVerification(user.id);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      // Continue with registration even if email fails
    }

    // Generate tokens
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

  private sanitizeUser(user: User): Omit<User, "password"> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...sanitized } = user;
    return sanitized;
  }
}
