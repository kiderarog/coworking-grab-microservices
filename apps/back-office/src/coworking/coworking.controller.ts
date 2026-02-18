import {Body, Controller, Post, Req, Res} from '@nestjs/common';
import { CoworkingService } from './coworking.service';
import {Authorization, Roles} from "../security";
import {AddCoworkingDto} from "./dto/add-coworking-dto";

@Controller('coworking')
export class CoworkingController {
  constructor(private readonly coworkingService: CoworkingService) {}

    @Post()
    @Authorization()
    @Roles('ADMIN', 'SUPERADMIN')
    async createCoworking (@Body() dto: AddCoworkingDto) {
      return this.coworkingService.addCoworking(dto);
    }
}
