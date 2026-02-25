import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class InternalGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        const key = req.headers['x-internal-key'];

        return key === process.env.INTERNAL_API_KEY;
    }
}
