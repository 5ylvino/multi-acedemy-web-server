import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SecurityService } from '../security/security.service';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private securityService: SecurityService,
    private configService: ConfigService,
    @Inject('REDIS_CLIENT') private redis: any,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.securityService.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    // Update last login
    await this.userRepository.update(user.id, { lastLogin: new Date() });

    // Generate tokens
    const payload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    // Store session in Redis
    await this.redis.setex(`session:${user.id}`, 900, accessToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        schoolLevel: user.schoolLevel,
        permissions: user.permissions,
      },
      token: accessToken,
      refresh_token: refreshToken.token,
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const passwordHash = await this.securityService.hashPassword(registerDto.password);

    const user = this.userRepository.create({
      email: registerDto.email,
      passwordHash,
      name: registerDto.name,
      organizationId: registerDto.organizationId,
      role: registerDto.role || 'user',
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate tokens for auto-login after registration
    const payload = {
      sub: savedUser.id,
      email: savedUser.email,
      organizationId: savedUser.organizationId,
      role: savedUser.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(savedUser.id);

    // Store session in Redis
    await this.redis.setex(`session:${savedUser.id}`, 900, accessToken);

    const { passwordHash: _, ...userResult } = savedUser;
    return {
      user: {
        id: userResult.id,
        email: userResult.email,
        name: userResult.name,
        role: userResult.role,
        organizationId: userResult.organizationId,
        schoolLevel: userResult.schoolLevel,
        permissions: userResult.permissions,
      },
      token: accessToken,
      refresh_token: refreshToken.token,
    };
  }

  async refreshToken(token: string) {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = refreshToken.user;
    const payload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      token: accessToken,
    };
  }

  async logout(userId: string, token: string) {
    // Remove session from Redis
    await this.redis.del(`session:${userId}`);

    // Invalidate refresh token
    await this.refreshTokenRepository.delete({ userId, token });

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    const token = this.securityService.generateSecureToken(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    await this.passwordResetRepository.save({
      userId: user.id,
      token,
      expiresAt,
    });

    // TODO: Send email with reset link
    // For now, return token (remove in production)
    return {
      message: 'Password reset token generated',
      token, // Remove in production
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const passwordReset = await this.passwordResetRepository.findOne({
      where: { token: resetPasswordDto.token },
      relations: ['user'],
    });

    if (!passwordReset || passwordReset.expiresAt < new Date() || passwordReset.usedAt) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await this.securityService.hashPassword(resetPasswordDto.password);

    await this.userRepository.update(passwordReset.userId, { passwordHash });
    await this.passwordResetRepository.update(passwordReset.id, { usedAt: new Date() });

    return { message: 'Password reset successfully' };
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  private async generateRefreshToken(userId: string): Promise<RefreshToken> {
    const token = this.securityService.generateSecureToken(64);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const refreshToken = this.refreshTokenRepository.create({
      userId,
      token,
      expiresAt,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }
}
