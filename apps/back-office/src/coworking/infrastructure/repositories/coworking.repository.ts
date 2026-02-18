import {Injectable} from "@nestjs/common";
import {prisma} from '../../../prisma';

@Injectable()
export class CoworkingRepository {

    async addCoworking(data: {
        name: string, description: string,
        location: string, price_for_day: number,
        price_for_month: number,
    }) {
        return prisma.coworking.create({data});
    }
}