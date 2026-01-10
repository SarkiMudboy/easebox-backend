import type { User } from "#db/schema/users.js";
import type { UserRepository } from "#repositories/user.repository.js";
import type { AuthResponse, RegisterIndividualInput } from "#types/index.js";

import { generateTokens } from "#utils/jwt.js";
import { hashPassword } from "#utils/password.js";

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
  constructor(private userRepository: UserRepository) {}

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
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      password: hashedPassword,
      phone: input.phone?.trim() ?? null,
      termsAccepted: true,
      userType: "individual",
    });

    // Generate tokens
    const tokens = generateTokens({
      email: user.email,
      userId: user.id,
      userType: user.userType,
    });

    return {
      tokens,
      user: this.sanitizeUser(user),
    };
  }

  private sanitizeUser(user: User): Omit<User, "password"> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...sanitized } = user;
    return sanitized;
  }
}
