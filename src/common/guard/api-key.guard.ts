import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from '../env.keys';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    
    const validApiKey = this.configService.get(EnvKeys.ADMIN_API_KEY);
    
    if (!apiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API Key');
    }
    
    return true;
  }
} 