import {ApiProperty} from "@nestjs/swagger";

export class CoworkingInfoDto {
    @ApiProperty()
    coworkingId: string;
    @ApiProperty()
    isFrozen: boolean;
    @ApiProperty()
    totalSpots: number;
    @ApiProperty()
    availableSpots: number;
    @ApiProperty()
    priceForDay: number;
    @ApiProperty()
    priceForMonth: number;



    constructor(coworkingId: string, isFrozen: boolean, totalSpots: number, availableSpots: number, priceForDay: number, priceForMonth: number) {
        this.coworkingId = coworkingId;
        this.isFrozen = isFrozen;
        this.totalSpots = totalSpots;
        this.availableSpots = availableSpots;
        this.priceForDay = priceForDay;
        this.priceForMonth = priceForMonth;

    }
}