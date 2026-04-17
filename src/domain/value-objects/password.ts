import argon2 from 'argon2';

const COMMON_PASSWORDS = [
  'password', '123456', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', 'dragon'
];

export class Password {
  private readonly value: string;
  private readonly hashed: boolean;

  private constructor(password: string, isHashed: boolean = false) {
    this.value = password;
    this.hashed = isHashed;
  }

  /**
   * Create a new password value object with validation
   */
  static create(password: string): Password {
    // Check minimum length
    if (password.length < 12) {
      throw new Error('Password must be at least 12 characters');
    }

    // Check uppercase
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    // Check lowercase
    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    // Check numbers
    if (!/\d/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    // Check special characters
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }

    // Check common passwords
    const lowerPassword = password.toLowerCase();
    for (const common of COMMON_PASSWORDS) {
      if (lowerPassword.includes(common)) {
        throw new Error('Password is too common');
      }
    }

    return new Password(password, false);
  }

  /**
   * Create a password from a hashed value (skips validation)
   */
  static fromHash(hash: string): Password {
    return new Password(hash, true);
  }

  /**
   * Hash the password using Argon2id
   */
  async hash(): Promise<string> {
    if (this.hashed) {
      return this.value;
    }
    return await argon2.hash(this.value, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }

  /**
   * Verify a password against a hash
   */
  static async verify(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  /**
   * Get the password value (plain text only if not hashed)
   */
  getValue(): string {
    if (this.hashed) {
      throw new Error('Cannot get plain text value of a hashed password');
    }
    return this.value;
  }

  /**
   * Check if this password instance is hashed
   */
  isHashed(): boolean {
    return this.hashed;
  }

  /**
   * Get the raw value (use carefully - returns hash if hashed)
   */
  toString(): string {
    return this.value;
  }
}
