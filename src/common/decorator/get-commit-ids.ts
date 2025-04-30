import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCommitIds = createParamDecorator<string[]>(
  (data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.body.commits.map((commit) => commit.id);
  },
);
