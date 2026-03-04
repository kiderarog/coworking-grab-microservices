import {Body, Controller, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {CoworkingService} from './coworking.service';
import {Authorization, Roles} from "../security";
import {AddCoworkingDto} from "./dto/add-coworking-dto";
import {UpdateCoworkingDto} from "./dto/update-coworking-dto";
import {InternalGuard} from "../security/guards/internal.guard";
import {CoworkingIdParamDto} from "./dto/coworking-id-param-dto";
import {ApiOperation, ApiParam, ApiResponse, ApiTags} from "@nestjs/swagger";
import {CoworkingResponseDto} from "./dto/coworking-response-dto";
import {CoworkingInfoDto} from "./dto/coworking-info.dto";
import {CoworkingFreezeStatusDto} from "./dto/coworking-freeze-status-dto";

@ApiTags('Coworkings')
@Controller('coworkings')
export class CoworkingController {
    constructor(private readonly coworkingService: CoworkingService) {
    }

    @Get()
    @Authorization()
    @ApiOperation({summary: 'getting all coworking spaces'})
    @ApiResponse({status: 200, description: 'Got coworking spaces list', type: CoworkingResponseDto, isArray: true})
    @ApiResponse({status: 500, description: 'Error while getting coworking list'})
    async getAllCoworkingSpaces() {
        return this.coworkingService.getCoworkingsList();
    }

    @Get(':id')
    @Authorization()
    @ApiOperation({summary: 'Get coworking by coworking ID'})
    @ApiParam({ name: 'id', type: 'string', description: 'Coworking ID', example: 'UUID' })
    @ApiResponse({status: 200, description: 'Got coworking by coworking ID', type: CoworkingResponseDto})
    @ApiResponse({status: 404, description: 'Coworking Not Found'})
    @ApiResponse({status: 500, description: 'Error while getting coworking by ID'})
    async getCoworking(@Param() data: CoworkingIdParamDto) {
        return this.coworkingService.getCoworking(data.id);
    }

    // Операционная информация для проверки возможности бронирования (isFrozen, availableSpots на клиент)

    @Get(':id/is-available')
    @UseGuards(InternalGuard)
    @ApiOperation({summary: 'Get coworking by coworking ID (for booking operation only. Not for view)'})
    @ApiParam({name: 'id', type: 'string', description: 'Coworking ID', example: 'UUID'})
    @ApiResponse({status: 200, description: 'Got coworking by coworking ID (booking operation)', type: CoworkingInfoDto})
    @ApiResponse({status: 400, description: 'Bad Request. Empty ID'})
    @ApiResponse({status: 404, description: 'Coworking not found. Invalid ID'})
    @ApiResponse({status: 500, description: 'Error while getting coworking booking info'})
    async isAvailableForBooking(@Param() data: CoworkingIdParamDto){
        return this.coworkingService.getCoworkingInfoForBookingOperation(data.id);
    }

    @Post()
    @Authorization()
    @Roles('ADMIN', 'SUPERADMIN')
    @ApiOperation({summary: 'Creating coworking endpoint'})
    @ApiResponse({status: 200, description: 'Coworking successfully created', type: CoworkingInfoDto})
    @ApiResponse({status: 500, description: 'Error while creating coworking or it\'s own spots'})
    async createCoworking(@Body() dto: AddCoworkingDto) {
        return this.coworkingService.addCoworking(dto);
    }

    @Patch(':id')
    @Authorization()
    @Roles('ADMIN', 'SUPERADMIN')
    @ApiOperation({summary: 'Updating coworking endpoint'})
    @ApiResponse({status: 200, description: 'Coworking successfully updated', type: CoworkingResponseDto})
    @ApiResponse({status: 404, description: 'Coworking not found.'})
    @ApiResponse({status: 500, description: 'Internal error while updating coworking specs'})
    async updateCoworking(@Param() data: CoworkingIdParamDto, @Body() dto: UpdateCoworkingDto) {
        return this.coworkingService.updateCoworking(data.id, dto);
    }


    @Patch(":id/freeze")
    @Authorization()
    @Roles('ADMIN','SUPERADMIN')
    @ApiOperation({summary: 'Change freeze status endpoint'})
    @ApiParam({name: 'id', type: 'string', description: 'UUID of the coworking' })
    @ApiResponse({status: 200, description: 'Freeze status updated successfully', type: CoworkingFreezeStatusDto})
    @ApiResponse({status: 404, description: 'Coworking not found'})
    @ApiResponse({status: 500, description: ' Internal error while updating freeze status on some coworking'})
    async changeFreezeStatus(@Param() data: CoworkingIdParamDto) {
        return this.coworkingService.updateFreezeStatus(data.id);
    }

}
