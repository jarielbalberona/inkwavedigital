export interface User {
  id: string;
  clerkUserId: string | null;
  email: string;
  role: string;
  tenantId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  clerkUserId: string | null;
  email: string;
  role: string;
  tenantId: string | null;
}

export interface IUserRepository {
  /**
   * Create a new user
   */
  create(input: CreateUserInput): Promise<User>;

  /**
   * Find a user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find a user by Clerk ID
   */
  findByClerkUserId(clerkUserId: string): Promise<User | null>;

  /**
   * Find users by tenant ID
   */
  findByTenantId(tenantId: string): Promise<User[]>;

  /**
   * Update user's clerk user ID
   */
  updateClerkUserId(userId: string, clerkUserId: string): Promise<void>;
}

