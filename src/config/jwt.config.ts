import { JwtModule } from '@nestjs/jwt';

export const jwtModule = JwtModule.register({
  global: true,
});
