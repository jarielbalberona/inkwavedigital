import { ValidationError } from "../../shared/errors/domain-error.js";

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string = "PHP"
  ) {
    if (amount < 0) {
      throw new ValidationError("Money amount cannot be negative");
    }
    if (!currency || currency.length !== 3) {
      throw new ValidationError("Invalid currency code");
    }
  }

  static fromAmount(amount: number, currency: string = "PHP"): Money {
    return new Money(amount, currency);
  }

  static zero(currency: string = "PHP"): Money {
    return new Money(0, currency);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new ValidationError("Cannot add money with different currencies");
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new ValidationError("Cannot subtract money with different currencies");
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  isGreaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new ValidationError("Cannot compare money with different currencies");
    }
    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new ValidationError("Cannot compare money with different currencies");
    }
    return this.amount < other.amount;
  }

  toNumber(): number {
    return this.amount;
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}

