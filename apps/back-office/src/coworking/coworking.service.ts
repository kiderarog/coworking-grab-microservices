import {BadRequestException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {CoworkingRepository} from "./infrastructure/repositories/coworking.repository";
import {SpotRepository} from "../spot/infrastructure/repositories/spot.repository";
import {AddCoworkingDto} from "./dto/add-coworking-dto";
import {UpdateCoworkingDto} from "./dto/update-coworking-dto";
import {prisma} from "../prisma";
import {CoworkingInfoDto} from "./dto/coworking-info.dto";


@Injectable()
export class CoworkingService {
    private readonly coworkingRepository: CoworkingRepository;
    private readonly spotRepository: SpotRepository;

    constructor(coworkingRepository: CoworkingRepository, spotRepository: SpotRepository) {
        this.coworkingRepository = coworkingRepository;
        this.spotRepository = spotRepository;
    }

    async addCoworking(dto: AddCoworkingDto) {
        try {
            return await prisma.$transaction(async (transaction) => {
                const coworking = await this.coworkingRepository.addCoworking(transaction, {
                    name: dto.name,
                    description: dto.description,
                    location: dto.location,
                    price_for_day: dto.priceForDay,
                    price_for_month: dto.priceForMonth
                });
                await this.spotRepository.addSpots(transaction, {
                    coworking_id: coworking.id,
                    amount_of_spots: dto.amountOfSpots
                });
                return coworking;
            })
        } catch (e) {
            throw new InternalServerErrorException("Error while creating coworking or it's own spots");
        }

    }

    async updateCoworking(coworkingId: string, dto: UpdateCoworkingDto) {
        if (!coworkingId) {
            throw new BadRequestException("Coworking ID is required for some edit")
        }
        try {
            return await this.coworkingRepository.updateCoworking(coworkingId, {
                name: dto.name,
                description: dto.description,
                location: dto.location,
                price_for_day: dto.priceForDay,
                price_for_month: dto.priceForMonth
            });
        } catch (error: any) {
            if (error.code === 'P2025') {
                throw new NotFoundException("Coworking not found");
            }
            throw new InternalServerErrorException("Internal error while updating coworking specs");
        }
    }

    async updateFreezeStatus(coworkingId: string) {
        if (!coworkingId) {
            throw new NotFoundException("Coworking ID is NOT acceptable");
        }
        try {
            const coworking = await this.coworkingRepository.findCoworkingById(coworkingId);
            if (coworking) {
                let frozenOrNot = !coworking.isFrozen;
                return this.coworkingRepository.updateFreezeState(coworkingId, frozenOrNot);
            } else {
                throw new NotFoundException("No such coworking");
            }
        } catch (error: any) {
            console.error(error);
            if (error.code === 'P2025') {
                throw new NotFoundException("Coworking not found");
            }
            throw new InternalServerErrorException("Failed to update freeze status");
        }
    }

    async getCoworkingsList() {
        try {
            return this.coworkingRepository.findAllCoworkingSpaces();
        } catch (error) {
            throw new InternalServerErrorException("Error while getting coworking list");
        }
    }

    async getCoworking(coworkingId: string) {
        try {
            return this.coworkingRepository.findCoworkingById(coworkingId);
        } catch (error) {
            throw new InternalServerErrorException("Error while getting coworking by ID");
        }
    }

    async getCoworkingInfoForBookingOperation(coworkingId: string) {
        if (!coworkingId) {
            throw new BadRequestException("Coworking ID is required to make info request");
        }

        const coworking = await this.coworkingRepository.getCoworkingInfoForBookingSpot(coworkingId);
        if (!coworking) {
            throw new NotFoundException("Coworking not found");
        }

        const totalSpots = await this.spotRepository.countTotalSpots(coworkingId);
        const availableSpots = await this.spotRepository.countAvailableSpots(coworkingId);
        return new CoworkingInfoDto(
            coworking.id,
            coworking.isFrozen,
            totalSpots,
            availableSpots
        );
    }

}

// ПРИЗМА:
// P2002 - проблема уникального поля
// P2005 - невалидное значение поля
// P2025 - запись не найдена