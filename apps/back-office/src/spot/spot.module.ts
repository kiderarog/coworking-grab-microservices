import {Module, forwardRef } from '@nestjs/common';
import {SpotService} from './spot.service';
import {SpotController} from './spot.controller';
import {SpotRepository} from "./infrastructure/repositories/spot.repository";
import { CoworkingModule } from "../coworking/coworking.module";

@Module({
    imports: [forwardRef(() => CoworkingModule)],
    controllers: [SpotController],
    providers: [SpotService, SpotRepository],
    exports: [SpotRepository]
})
export class SpotModule {
}
