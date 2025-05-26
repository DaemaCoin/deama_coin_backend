import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCommitIds = createParamDecorator<string[]>(
  (data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log('\n---COMMITS - BODY ---\n');
    console.log(request.body);
    
    return request.body.commits.map((commit) => commit.id);
  },
);
