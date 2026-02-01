import { Injectable } from '@nestjs/common';
import { prisma } from './prisma';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async test(name: string) {
    return prisma.user.create({
      data: { name }
    });
  }

}
