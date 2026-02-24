import { Injectable } from '@nestjs/common';
import {BookingRepository} from "./infrastructure/repositories/booking.repository";

@Injectable()
export class BookingService {
    private readonly bookingRepository: BookingRepository;

    constructor(bookingRepository: BookingRepository) {
        this.bookingRepository = bookingRepository;
    }
}
