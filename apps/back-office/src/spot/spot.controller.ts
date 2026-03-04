import {Controller, Get, Param, Post} from '@nestjs/common';
import {SpotService} from './spot.service';
import {Authorization, Roles} from "../security";
import {CoworkingIdParamDto} from "./dto/coworking-id-param-dto";
import {ApiOperation, ApiParam, ApiResponse, ApiTags} from "@nestjs/swagger";
import {SpotResponseDto} from "./dto/spot-response-dto";

@ApiTags('Spots')
@Controller('spots')
export class SpotController {
    constructor(private readonly spotService: SpotService) {
    }

    @Get(':coworkingId')
    @Authorization()
    @Roles('ADMIN', 'SUPERADMIN')
    @ApiOperation({summary: 'Get all spots for a specific coworking space'})
    @ApiParam({name: 'coworkingId', type: 'string', description: 'UUID (coworkingId)'})
    @ApiResponse({status: 200, description: 'Got list of spots for the coworking space', type: SpotResponseDto, isArray: true})
    @ApiResponse({ status: 400, description: 'Bad Request. Missing or invalid coworking ID' })
    @ApiResponse({ status: 404, description: 'Coworking not found' })
    @ApiResponse({ status: 500, description: 'Internal server error while fetching spots' })
    async getAllSpotsByCoworkingId(@Param() data: CoworkingIdParamDto) {
        return this.spotService.getAllSpotsByCoworkingId(data.coworkingId);
    }

    // Закрытый эндпоинт (прим. запрос внутри системы)
    @Post(':coworkingId/book')
    @Authorization()
    async bookSpot(@Param() data: CoworkingIdParamDto) {
        return this.spotService.bookSpot(data.coworkingId);
    }
}
