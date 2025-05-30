import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { GithubService } from './github.service';
import { XquareService } from './xquare.service';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), WalletModule],
  controllers: [AuthController],
  providers: [AuthService, GithubService, XquareService],
  exports: [TypeOrmModule.forFeature([UserEntity])],
})
export class AuthModule {}
