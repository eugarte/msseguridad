import { Request, Response } from 'express';
import {
  RegisterUserUseCase,
  LoginUserUseCase,
  RefreshTokenUseCase,
  LogoutUserUseCase,
  GetUserProfileUseCase,
} from '@application/use-cases/auth';
import { authenticateToken } from '../middleware/auth.middleware';

export class AuthController {
  private registerUseCase = new RegisterUserUseCase();
  private loginUseCase = new LoginUserUseCase();
  private refreshUseCase = new RefreshTokenUseCase();
  private logoutUseCase = new LogoutUserUseCase();
  private getProfileUseCase = new GetUserProfileUseCase();

  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.registerUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.loginUseCase.execute({
        email: req.body.email,
        password: req.body.password,
        ipAddress: req.ip || undefined,
        userAgent: req.get('user-agent') || undefined,
      });
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.refreshUseCase.execute(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      await this.logoutUseCase.execute({
        userId: (req as any).user?.id,
        refreshToken: req.body.refreshToken,
        allSessions: req.body.allSessions,
      });
      res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.getProfileUseCase.execute({
        userId: (req as any).user?.id,
      });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
