export class CoworkingInfoDto {
    coworkingId: string;
    isFrozen: boolean;
    totalSpots: number;
    availableSpots: number;


    constructor(coworkingId: string, isFrozen: boolean, totalSpots: number, availableSpots: number) {
        this.coworkingId = coworkingId;
        this.isFrozen = isFrozen;
        this.totalSpots = totalSpots;
        this.availableSpots = availableSpots;
    }
}