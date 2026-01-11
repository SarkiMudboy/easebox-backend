import type { OtpType } from "#infrastructure/database/schema/users.js";
import type { OtpRepository } from "#repositories/otp.repository.js";
import type { UserRepository } from "#repositories/user.repository.js";

import { EmailService, SmsService } from "#modules/notifications/index.js";

const OTP_EXPIRY_MINUTES = 10;

export class VerificationError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = "VerificationError";
  }
}

export class VerificationService {
  private emailService: EmailService;
  private smsService: SmsService;

  constructor(
    private otpRepository: OtpRepository,
    private userRepository: UserRepository
  ) {
    this.emailService = new EmailService();
    this.smsService = new SmsService();
  }

  async sendEmailVerification(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new VerificationError("User not found", "USER_NOT_FOUND");
    }

    if (user.emailVerified) {
      throw new VerificationError(
        "Email is already verified",
        "ALREADY_VERIFIED"
      );
    }

    // Delete any existing email OTPs for this user
    await this.otpRepository.deleteByUserIdAndType(userId, "email");

    // Generate and store new OTP
    const code = this.generateOtp();
    await this.otpRepository.create({
      code,
      expiresAt: this.getExpiryDate(),
      type: "email",
      userId,
    });

    // Send verification email
    const sent = await this.emailService.sendVerificationEmail(
      user.email,
      code
    );
    if (!sent) {
      throw new VerificationError(
        "Failed to send verification email",
        "EMAIL_SEND_FAILED"
      );
    }
  }

  async sendPhoneVerification(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new VerificationError("User not found", "USER_NOT_FOUND");
    }

    if (user.phoneVerified) {
      throw new VerificationError(
        "Phone is already verified",
        "ALREADY_VERIFIED"
      );
    }

    // Get user's phone number from profile
    const phone = await this.getUserPhone(userId, user.userType);
    if (!phone) {
      throw new VerificationError(
        "No phone number registered for this account",
        "NO_PHONE_NUMBER"
      );
    }

    // Delete any existing phone OTPs for this user
    await this.otpRepository.deleteByUserIdAndType(userId, "phone");

    // Generate and store new OTP
    const code = this.generateOtp();
    await this.otpRepository.create({
      code,
      expiresAt: this.getExpiryDate(),
      type: "phone",
      userId,
    });

    // Send verification SMS
    const sent = this.smsService.sendVerificationSms(phone, code);
    if (!sent) {
      throw new VerificationError(
        "Failed to send verification SMS",
        "SMS_SEND_FAILED"
      );
    }
  }

  async verifyOtp(userId: string, code: string, type: OtpType): Promise<void> {
    const otp = await this.otpRepository.findValidOtp(userId, code, type);
    if (!otp) {
      throw new VerificationError(
        "Invalid or expired verification code",
        "INVALID_OTP"
      );
    }

    // Mark user as verified
    if (type === "email") {
      await this.userRepository.update(userId, { emailVerified: true });
    } else {
      await this.userRepository.update(userId, { phoneVerified: true });
    }

    // Delete the used OTP
    await this.otpRepository.deleteById(otp.id);
  }

  private generateOtp(): string {
    // Generate 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getExpiryDate(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + OTP_EXPIRY_MINUTES);
    return expiry;
  }

  private async getIndividualProfile(userId: string) {
    // Import here to avoid circular dependency
    const { individualProfiles } = await import("#infrastructure/database/schema/users.js");
    const { db } = await import("#infrastructure/database/index.js");
    const { eq } = await import("drizzle-orm");

    const results = await db
      .select()
      .from(individualProfiles)
      .where(eq(individualProfiles.userId, userId));
    return results[0] as (typeof results)[0] | undefined;
  }

  private async getUserPhone(
    userId: string,
    userType: string
  ): Promise<null | string> {
    // For now, only handle individual profiles
    // Add other profile types as needed
    if (userType === "individual") {
      const profile = await this.getIndividualProfile(userId);
      return profile?.phone ?? null;
    }
    return null;
  }
}

