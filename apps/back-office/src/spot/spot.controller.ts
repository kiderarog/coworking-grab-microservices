import {Controller, Get, Param, Post} from '@nestjs/common';
import { SpotService } from './spot.service';
import {Authorization, Roles} from "../security";
import {CoworkingIdParamDto} from "./dto/coworking-id-param-dto";

@Controller('spots')
export class SpotController {
  constructor(private readonly spotService: SpotService) {}

    @Get(':coworkingId')
    @Authorization()
    @Roles('ADMIN', 'SUPERADMIN')
    async getAllSpotsByCoworkingId(@Param() data: CoworkingIdParamDto) {
      return this.spotService.getAllSpotsByCoworkingId(data.coworkingId);
    }

    @Post(':coworkingId/book')
    @Authorization()
    async bookSpot(@Param() data: CoworkingIdParamDto) {
      return this.spotService.bookSpot(data.coworkingId);
    }
}
