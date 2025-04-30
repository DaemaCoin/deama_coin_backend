import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetEntityManager = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.queryRunnerManager;
  },
);
