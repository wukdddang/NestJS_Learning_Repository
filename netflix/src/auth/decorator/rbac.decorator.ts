import { Reflector } from '@nestjs/core';
import { ROLE } from 'src/user/entities/user.entity';

export const RBAC = Reflector.createDecorator<ROLE>();
