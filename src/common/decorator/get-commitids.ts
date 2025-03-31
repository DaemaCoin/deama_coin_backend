import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCommitIds = createParamDecorator(
  (data, context: ExecutionContext): string[] => {
    const req = context.switchToHttp().getRequest();
    return req.body.commits.map((value) => value.id);
  },
);
