import { GetUserProfileRequest, GetUserProfileResponse } from '@application/dtos/auth.dto';
import { AppDataSource } from '@infrastructure/config/database';
import { User } from '@domain/entities/user';
import { PermissionEvaluator } from '@domain/services/permission-evaluator';

export class GetUserProfileUseCase {
  async execute(request: GetUserProfileRequest): Promise<GetUserProfileResponse> {
    const userRepository = AppDataSource.getRepository(User);
    
    const user = await userRepository.findOne({
      where: { id: request.userId },
      relations: ['roles', 'roles.permissions'],
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const permissions = PermissionEvaluator.getUserPermissions(user);
    
    return {
      id: user.id,
      email: user.email,
      status: user.status,
      roles: user.roles?.map(r => r.slug) || [],
      permissions: permissions.map(p => p.slug),
      mfaEnabled: user.mfaEnabled,
      lastLoginAt: user.lastLoginAt || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
