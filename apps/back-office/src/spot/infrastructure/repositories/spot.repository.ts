import {Injectable} from "@nestjs/common";


@Injectable()
export class SpotRepository {

    async addSpots(transaction: any, data: { coworking_id: string; amount_of_spots: number }) {
        const spots: any[] = [];
        for (let i = 0; i < data.amount_of_spots; i++) {
            spots.push({
                coworking_id: data.coworking_id,
                spot_number: i + 1,
                status: 'FREE',
            });
        }
        await transaction.spot.createMany({
            data: spots,
        });
    }

}