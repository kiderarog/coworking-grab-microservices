import {Controller} from "@nestjs/common";
import {Ctx, EventPattern, Payload, RmqContext} from "@nestjs/microservices";
import {SpotService} from "../spot/spot.service";
import {ActiveBookingEventDto} from "./dto/active-booking-event.dto";
import {RmqService} from "./rmq.service";
import {ExpiredBookingEventDto} from "./dto/expired-booking-event.dto";

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

    @EventPattern('booking.expired')
    public async handleExpiredBookingEvent(@Payload() data: ExpiredBookingEventDto, @Ctx() ctx: RmqContext) {
        try {
            console.log("EXPIRED BOOKING EVENT RECEIVED: " + JSON.stringify(data));
            await this.spotService.releaseSpot(data.coworkingId);
            this.rmqService.ack(ctx);
        } catch (error) {
            console.log("EXPIRED BOOKING EVENT PROCESSING ERROR " + error);
            this.rmqService.nack(ctx);
        }
    }
}

