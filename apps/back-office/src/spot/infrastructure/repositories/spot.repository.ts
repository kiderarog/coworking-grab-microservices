import {Injectable} from "@nestjs/common";
import {prisma} from '../../../prisma';


@Injectable()
export class SpotRepository {

    async addSpots(data: { coworking_id: string; amount_of_spots: number }) {
        const spots: any[] = [];
        for (let i = 0; i < data.amount_of_spots; i++) {
            spots.push({
                coworking_id: data.coworking_id,
                spot_number: i + 1,
                status: 'FREE',
            });
        }
        await prisma.spot.createMany({
            data: spots,
        });
    }

}