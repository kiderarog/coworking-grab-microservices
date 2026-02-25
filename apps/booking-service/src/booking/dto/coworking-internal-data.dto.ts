export class CoworkingInternalDataDto {
    coworkingId: string;
    isFrozen: boolean;
    totalSpots: number;
    availableSpots: number;
    priceForDay: number;
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