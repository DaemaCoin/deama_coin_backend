import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCommitData = createParamDecorator<{
  fullName: string;
  commitIds: string[];
}>(
  (
    data: any,
    ctx: ExecutionContext,
  ): {
    fullName: string;
    commitIds: string[];
  } => {
    const request = ctx.switchToHttp().getRequest();
    console.log('\n---COMMITS - BODY ---\n');
    console.log(request.body);

    return {
      fullName: request.body.repository.full_name,
      commitIds: request.body.commits.map((commit) => commit.id),
    };
  },
);
