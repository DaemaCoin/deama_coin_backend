import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubClient } from './github-client';

@Module({
  providers: [GithubService, GithubClient],
  exports: [GithubService],
})
export class GithubModule {}
