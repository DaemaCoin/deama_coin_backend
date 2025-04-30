import { Reflector } from "@nestjs/core";
import { USER_ROLE } from "../enum/user-role";

export const RBAC = Reflector.createDecorator<USER_ROLE>();