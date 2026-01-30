import {Controller, Get} from '@nestjs/common';
import {AppService} from './app.service';
import {ApiResponse} from "@nestjs/swagger";
import {HealthResponseDto} from "./dto/health-response-dto";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {
    }

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @ApiResponse({type: HealthResponseDto})
    @Get('health')
    getHealth() {
        return this.appService.health();
    }
}
