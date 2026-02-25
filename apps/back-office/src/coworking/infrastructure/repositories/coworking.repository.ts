import {Injectable} from "@nestjs/common";
import {prisma} from '../../../prisma';

@Injectable()
export class CoworkingRepository {

    async addCoworking(transaction: any, data: {
        name: string, description: string,
        location: string, price_for_day: number,
        price_for_month: number,
    }) {
        return transaction.coworking.create({data});
    }

    async updateCoworking(coworkingId: string, data: {
        name?: string, description?: string,
        location?: string, price_for_day?: number,
        price_for_month?: number
    }) {
        return prisma.coworking.update({
            where: {
                id: coworkingId
            }, data
        })
    }

    async updateFreezeState(coworkingId: string, isFrozen: boolean) {
        return prisma.coworking.update({
            where: {
                id: coworkingId
            }, data: {
                isFrozen
            }
        })
    }

    async findCoworkingById(coworkingId: string) {
        return prisma.coworking.findUnique({
            where: {
                id: coworkingId
            }
        })
    }

    async findAllCoworkingSpaces() {
        return prisma.coworking.findMany();
    }

    async getCoworkingInfoForBookingSpot(coworkingId: string) {
        return prisma.coworking.findUnique({
            where: {
                id: coworkingId
            }, select: { id: true, isFrozen: true, price_for_day: true, price_for_month: true}
        })
    }


}