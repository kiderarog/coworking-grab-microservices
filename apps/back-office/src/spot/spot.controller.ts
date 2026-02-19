import {Controller, Get, Param, Post} from '@nestjs/common';
import { SpotService } from './spot.service';
import {Authorization, Roles} from "../security";

@Controller('spots')
export class SpotController {
  constructor(private readonly spotService: SpotService) {}

    @Get(':id')
    @Authorization()
    @Roles('ADMIN', 'SUPERADMIN')
    async getAllSpotsByCoworkingId(@Param('id') coworkingId: string) {
      return this.spotService.getAllSpotsByCoworkingId(coworkingId);
    }

    @Post(':coworkingId/book')
    @Authorization()
    async bookSpot(@Param('coworkingId') coworkingId: string) {
      return this.spotService.bookSpot(coworkingId);
    }
}
