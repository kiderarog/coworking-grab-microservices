import {BookingStatus} from "../../../generated/prisma/enums";

export class CreateBookingData {
    coworking_id: string;
    user_id: string;
    start_time: Date;
    end_time: Date;
    amount_of_money: number;
    status: BookingStatus;
    expires_at: Date;

    constructor(data: {
        coworking_id: string,
        user_id: string,
        start_time: Date,
        end_time: Date,
        amount_of_money: number,
        status: BookingStatus,
        expires_at: Date
    }) {
        this.coworking_id = data.coworking_id;
        this.user_id = data.user_id;
        this.start_time = data.start_time;
        this.end_time = data.end_time;
        this.amount_of_money = data.amount_of_money;
        this.status = data.status;
        this.expires_at = data.expires_at;
    }
}