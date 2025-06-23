import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetStoreId = createParamDecorator<number>(
  (data: any, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    return request.store;
  },
);
