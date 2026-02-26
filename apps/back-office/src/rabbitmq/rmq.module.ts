import {Global, Module} from '@nestjs/common';
import { RmqService } from './rmq.service';
import {BookingEventsController} from "./booking.events.controller";
import {SpotModule} from "../spot/spot.module";

@Global()
@Module({
    imports: [SpotModule],
    providers: [RmqService],
    controllers: [BookingEventsController],
    exports: [RmqService]
})
export class RmqModule {}
