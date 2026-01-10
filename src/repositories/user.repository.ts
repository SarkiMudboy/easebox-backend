import type { Database } from "#db/index.js";
import type { NewUser, User } from "#db/schema/users.js";

import { users } from "#db/schema/users.js";
import { eq } from "drizzle-orm";

export class UserRepository {
  constructor(private db: Database) {}

  async create(data: NewUser): Promise<User> {
    const [user] = await this.db.insert(users).values(data).returning();
    return user;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== undefined;
  }

  async findByEmail(email: string): Promise<undefined | User> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async findById(id: string): Promise<undefined | User> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async update(id: string, data: Partial<NewUser>): Promise<undefined | User> {
    const [user] = await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
}
