export interface IBetaSignupRepository {
  create(data: { email: string; establishmentName: string }): Promise<{ id: string; email: string; establishmentName: string; createdAt: Date }>;
  findByEmail(email: string): Promise<{ id: string; email: string; establishmentName: string; createdAt: Date } | null>;
}

