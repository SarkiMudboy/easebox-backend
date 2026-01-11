import type { Database } from "#db/index.js";
import type {
  IndividualProfile,
  NewIndividualProfile,
} from "#db/schema/users.js";

import { individualProfiles } from "#db/schema/users.js";
import { eq } from "drizzle-orm";

export class IndividualProfileRepository {
  constructor(private db: Database) {}

  async create(data: NewIndividualProfile): Promise<IndividualProfile> {
    const [profile] = await this.db
      .insert(individualProfiles)
      .values(data)
      .returning();
    return profile;
  }

  async findById(id: string): Promise<IndividualProfile | undefined> {
    const [profile] = await this.db
      .select()
      .from(individualProfiles)
      .where(eq(individualProfiles.id, id));
    return profile;
  }

  async findByUserId(userId: string): Promise<IndividualProfile | undefined> {
    const [profile] = await this.db
      .select()
      .from(individualProfiles)
      .where(eq(individualProfiles.userId, userId));
    return profile;
  }

  async update(
    id: string,
    data: Partial<NewIndividualProfile>
  ): Promise<IndividualProfile | undefined> {
    const [profile] = await this.db
      .update(individualProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(individualProfiles.id, id))
      .returning();
    return profile;
  }
}
