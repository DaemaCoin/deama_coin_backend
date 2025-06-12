import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { XquareService } from './xquare.service';
import { WalletModule } from 'src/wallet/wallet.module';
import { GithubModule } from 'src/github/github.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), WalletModule, GithubModule],
  controllers: [AuthController],
  providers: [AuthService, XquareService],
  exports: [TypeOrmModule.forFeature([UserEntity])],
})
export class AuthModule {}
