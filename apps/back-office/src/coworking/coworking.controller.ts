import {Body, Controller, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {CoworkingService} from './coworking.service';
import {Authorization, Roles} from "../security";
import {AddCoworkingDto} from "./dto/add-coworking-dto";
import {UpdateCoworkingDto} from "./dto/update-coworking-dto";
import {InternalGuard} from "../security/guards/internal.guard";
import {CoworkingIdParamDto} from "./dto/coworking-id-param-dto";

@Controller('coworkings')
export class CoworkingController {
    constructor(private readonly coworkingService: CoworkingService) {
    }

    @Get()
    @Authorization()
    async getAllCoworkingSpaces() {
        return this.coworkingService.getCoworkingsList();
    }

    @Get(':id')
    @Authorization()
    async getCoworking(@Param() data: CoworkingIdParamDto) {
        return this.coworkingService.getCoworking(data.id);
    }

    // Операционная информация для проверки возможности бронирования (isFrozen, availableSpots на клиент)
    @Get(':id/is-available')
    @UseGuards(InternalGuard)
    async isAvailableForBooking(@Param() data: CoworkingIdParamDto){
        return this.coworkingService.getCoworkingInfoForBookingOperation(data.id);
    }

    @Post()
    @Authorization()
    @Roles('ADMIN', 'SUPERADMIN')
    async createCoworking(@Body() dto: AddCoworkingDto) {
        return this.coworkingService.addCoworking(dto);
    }

    @Patch(':id')
    @Authorization()
    @Roles('ADMIN', 'SUPERADMIN')
    async updateCoworking(@Param() data: CoworkingIdParamDto, @Body() dto: UpdateCoworkingDto) {
        return this.coworkingService.updateCoworking(data.id, dto);
    }

    @Patch(":id/freeze")
    @Authorization()
    @Roles('ADMIN','SUPERADMIN')
    async changeFreezeStatus(@Param() data: CoworkingIdParamDto) {
        return this.coworkingService.updateFreezeStatus(data.id);
    }

}
