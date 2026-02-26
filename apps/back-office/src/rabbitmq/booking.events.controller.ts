import {Controller} from "@nestjs/common";
import {Ctx, EventPattern, Payload, RmqContext} from "@nestjs/microservices";
import {SpotService} from "../spot/spot.service";
import {ActiveBookingEventDto} from "./dto/active-booking-event.dto";
import {RmqService} from "./rmq.service";

@Controller()
export class BookingEventsController {
    public constructor(
        private readonly rmqService: RmqService,
        private readonly spotService: SpotService) {
    }

    @EventPattern('booking.active')
    public async handleActiveBookingEvent(@Payload() data: ActiveBookingEventDto, @Ctx() ctx: RmqContext) {
        try {
            console.log("ACTIVE BOOKING EVENT RECEIVED: " + JSON.stringify(data));
            await this.spotService.bookSpot(data.coworkingId);
            this.rmqService.ack(ctx);
        } catch (error) {
            console.log("ACTIVE BOOKING EVENT PROCESSING ERROR " + error);
            this.rmqService.nack(ctx);
        }
    }
}

