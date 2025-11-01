import { injectable, inject } from "tsyringe";
import type { Logger } from "@inkwave/utils";
import type { IBetaSignupRepository } from "../../domain/repositories/IBetaSignupRepository.js";
import { ValidationError, DomainError } from "../../shared/errors/domain-error.js";

export interface CreateBetaSignupInput {
  email: string;
  establishmentName: string;
}

export interface CreateBetaSignupOutput {
  id: string;
  email: string;
  establishmentName: string;
  createdAt: string;
}

@injectable()
export class CreateBetaSignupUseCase {
  constructor(
    @inject("IBetaSignupRepository") private betaSignupRepository: IBetaSignupRepository,
    @inject("Logger") private logger: Logger
  ) {}

  async execute(input: CreateBetaSignupInput): Promise<CreateBetaSignupOutput> {
    this.logger.info({ email: input.email }, "Creating beta signup");

    // Validate input
    if (!input.email || !input.email.trim()) {
      throw new ValidationError("Email is required");
    }

    if (!input.establishmentName || !input.establishmentName.trim()) {
      throw new ValidationError("Establishment name is required");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email.trim())) {
      throw new ValidationError("Invalid email format");
    }

    // Check if email already exists
    const existing = await this.betaSignupRepository.findByEmail(input.email);
    if (existing) {
      throw new DomainError("Email already registered for beta");
    }

    // Create beta signup
    const signup = await this.betaSignupRepository.create({
      email: input.email.trim(),
      establishmentName: input.establishmentName.trim(),
    });

    this.logger.info({ signupId: signup.id, email: signup.email }, "Beta signup created successfully");

    return {
      id: signup.id,
      email: signup.email,
      establishmentName: signup.establishmentName,
      createdAt: signup.createdAt.toISOString(),
    };
  }
}

