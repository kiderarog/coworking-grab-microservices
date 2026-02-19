import {Injectable} from "@nestjs/common";
import {prisma} from "../../../prisma";
import {Spot} from "../../../../generated/prisma/client";
import {async} from "rxjs";


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

    async getSpotsByCoworkingId(coworkingId: string) {
        return prisma.spot.findMany({
            where: {coworking_id: coworkingId}
        });
    }

    async countAvailableSpots(coworkingId: string) {
        return prisma.spot.count({
            where: {
                coworking_id: coworkingId,
                status: 'FREE'
            }
        })
    }

    async countTotalSpots(coworkingId: string) {
        return prisma.spot.count({
            where: {
                coworking_id: coworkingId
            }
        })
    }

    async bookAvailableSpot(coworkingId: string) {
        return prisma.$transaction(async (transaction) => {
            const availableSpot = await transaction.spot.findFirst({
                where: {
                    coworking_id: coworkingId,
                    status: 'FREE'
                }
            });
            if (!availableSpot) {
                return null;
            }

            return transaction.spot.update({
                where: {
                    id: availableSpot.id
                }, data: {
                    status: "BOOKED"
                }
            });
        });
    }


}