import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUserId = createParamDecorator<string>(
  (data, context: ExecutionContext): string => {
    const contextType = context.getType();

    if (contextType === 'http') {
      const req = context.switchToHttp().getRequest();
      return req.user.id;
    } else if (contextType === 'ws') {
      const req = context.switchToWs().getClient();
      return req.user.id;
    } else {
      return '';
    }
  },
);
