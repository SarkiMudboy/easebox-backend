import type { Database } from "#infrastructure/database/index.js";
import type {
  NewOtp,
  Otp,
  OtpType,
} from "#infrastructure/database/schema/users.js";

import { otps } from "#infrastructure/database/schema/users.js";
import { and, eq, gt, lt } from "drizzle-orm";

export class OtpRepository {
  constructor(private db: Database) {}

  async create(data: NewOtp): Promise<Otp> {
    const [otp] = await this.db.insert(otps).values(data).returning();
    return otp;
  }

  async deleteById(id: string): Promise<void> {
    await this.db.delete(otps).where(eq(otps.id, id));
  }

  async deleteByUserIdAndType(userId: string, type: OtpType): Promise<void> {
    await this.db
      .delete(otps)
      .where(and(eq(otps.userId, userId), eq(otps.type, type)));
  }

  async deleteExpired(): Promise<void> {
    await this.db.delete(otps).where(lt(otps.expiresAt, new Date()));
  }

  async findValidOtp(
    userId: string,
    code: string,
    type: OtpType
  ): Promise<Otp | undefined> {
    const [otp] = await this.db
      .select()
      .from(otps)
      .where(
        and(
          eq(otps.userId, userId),
          eq(otps.code, code),
          eq(otps.type, type),
          gt(otps.expiresAt, new Date())
        )
      );
    return otp;
  }
}
