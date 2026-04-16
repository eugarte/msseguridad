import { User, UserStatus } from '@domain/entities/user';
import { Email } from '@domain/value-objects/email';
import { Password } from '@domain/value-objects/password';
import { RegisterUserRequest, RegisterUserResponse } from '@application/dtos/auth.dto';
import { AppDataSource } from '@infrastructure/config/database';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

export class RegisterUserUseCase {
  async execute(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    const userRepository = AppDataSource.getRepository(User);
    
    const email = new Email(request.email);
    new Password(request.password);
    
    const existingUser = await userRepository.findOne({
      where: { email: email.getValue() }
    });
    
    if (existingUser) {
      throw new Error('Email already registered');
    }
    
    const passwordHash = await argon2.hash(request.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
    
    const user = userRepository.create({
      id: uuidv4(),
      email: email.getValue(),
      passwordHash,
      status: UserStatus.PENDING,
      failedAttempts: 0,
      failedMfaAttempts: 0,
    });
    
    await userRepository.save(user);
    
    return {
      id: user.id,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt,
    };
  }
}
