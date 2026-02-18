import {Module} from '@nestjs/common';
import {SpotService} from './spot.service';
import {SpotController} from './spot.controller';
import {SpotRepository} from "./infrastructure/repositories/spot.repository";

@Module({
    controllers: [SpotController],
    providers: [SpotService, SpotRepository],
    exports: [SpotRepository]
})
export class SpotModule {
}
