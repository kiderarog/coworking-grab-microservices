import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import {RolesGuard} from '../guards/roles.guard';
import {JwtGuard} from "../guards/auth.guard";

export const ROLES_KEY = 'roles';

export function Roles(...roles: string[]) {
    return applyDecorators(
        SetMetadata(ROLES_KEY, roles),
        UseGuards(JwtGuard, RolesGuard)
    );
}
