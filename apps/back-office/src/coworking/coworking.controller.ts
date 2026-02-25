import {Body, Controller, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {CoworkingService} from './coworking.service';
import {Authorization, Roles} from "../security";
import {AddCoworkingDto} from "./dto/add-coworking-dto";
import {UpdateCoworkingDto} from "./dto/update-coworking-dto";
import {InternalGuard} from "../security/guards/internal.guard";

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
    async getCoworking(@Param('id') id: string) {
        return this.coworkingService.getCoworking(id);
    }

    // Операционная информация для проверки возможности бронирования (isFrozen, availableSpots на клиент)
    @Get(':id/is-available')
    @UseGuards(InternalGuard)
    async isAvailableForBooking(@Param('id') coworkingId: string){
        return this.coworkingService.getCoworkingInfoForBookingOperation(coworkingId);
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
    async updateCoworking(@Param('id') id: string, @Body() dto: UpdateCoworkingDto) {
        return this.coworkingService.updateCoworking(id, dto);
    }

    @Patch(":id/freeze")
    @Authorization()
    @Roles('ADMIN','SUPERADMIN')
    async changeFreezeStatus(@Param('id') id: string) {
        return this.coworkingService.updateFreezeStatus(id);
    }


}
