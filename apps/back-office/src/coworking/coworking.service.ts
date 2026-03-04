import {BadRequestException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {CoworkingRepository} from "./infrastructure/repositories/coworking.repository";
import {SpotRepository} from "../spot/infrastructure/repositories/spot.repository";
import {AddCoworkingDto} from "./dto/add-coworking-dto";
import {UpdateCoworkingDto} from "./dto/update-coworking-dto";
import {prisma} from "../prisma";
import {CoworkingInfoDto} from "./dto/coworking-info.dto";
import {InjectPinoLogger, PinoLogger} from "nestjs-pino";
import {CoworkingResponseDto} from "./dto/coworking-response-dto";
import {CoworkingFreezeStatusDto} from "./dto/coworking-freeze-status-dto";


@Injectable()
export class CoworkingService {
    private readonly coworkingRepository: CoworkingRepository;
    private readonly spotRepository: SpotRepository;
    @InjectPinoLogger(CoworkingService.name)
    private readonly logger: PinoLogger;

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
                this.logger.info({coworking_id: coworking.id}, 'Coworking successfully created');
                const createdCoworking = new CoworkingResponseDto();
                createdCoworking.id = coworking.id;
                createdCoworking.name = coworking.name;
                createdCoworking.description = coworking.description;
                createdCoworking.location = coworking.location;
                createdCoworking.priceForDay = Number(coworking.price_for_day);
                createdCoworking.priceForMonth = Number(coworking.price_for_month);

                return createdCoworking;
            })
        } catch (error: any) {
            this.logger.error({error, name: dto.name}, 'Error while creating coworking');
            throw new InternalServerErrorException("Error while creating coworking or it's own spots");
        }

    }

    async updateCoworking(coworkingId: string, dto: UpdateCoworkingDto) {
        if (!coworkingId) {
            this.logger.warn('Coworking ID is REQUIRED for update operation');
            throw new BadRequestException("Coworking ID is required for some edit")
        }
        this.logger.info({coworking_id: coworkingId}, 'Updating coworking');

        try {
            const updatedCoworking = await this.coworkingRepository.updateCoworking(coworkingId, {
                name: dto.name,
                description: dto.description,
                location: dto.location,
                price_for_day: dto.priceForDay,
                price_for_month: dto.priceForMonth
            });
            this.logger.info({coworking_id: updatedCoworking.id}, 'Coworking successfully updated');
            const updatedCoworkingDtoInstance = new CoworkingResponseDto();
            updatedCoworkingDtoInstance.id = updatedCoworking.id;
            updatedCoworkingDtoInstance.name = updatedCoworking.name;
            updatedCoworkingDtoInstance.description = updatedCoworking.description;
            updatedCoworkingDtoInstance.location = updatedCoworking.location;
            updatedCoworkingDtoInstance.priceForDay = Number(updatedCoworking.price_for_day);
            updatedCoworkingDtoInstance.priceForMonth = Number(updatedCoworking.price_for_month);

            return updatedCoworkingDtoInstance;
        } catch (error: any) {
            if (error.code === 'P2025') {
                this.logger.error({coworking_id: coworkingId}, 'Coworking not found (update error)');
                throw new NotFoundException("Coworking not found");
            }
            this.logger.error({error, coworking_id: coworkingId}, 'Internal error while updating coworking specs');
            throw new InternalServerErrorException("Internal error while updating coworking specs");
        }
    }

    async updateFreezeStatus(coworkingId: string) {
        if (!coworkingId) {
            this.logger.warn('Coworking ID is missing (changing freeze status)');
            throw new NotFoundException("Coworking ID is NOT acceptable");
        }
        try {
            const coworking = await this.coworkingRepository.findCoworkingById(coworkingId);
            if (coworking) {
                let frozenOrNot = !coworking.isFrozen;
                this.logger.info({coworking_id: coworkingId, new_state: frozenOrNot}, 'Freeze status updated');
                await this.coworkingRepository.updateFreezeState(coworkingId, frozenOrNot);
                const freezeStatusDto = new CoworkingFreezeStatusDto();
                freezeStatusDto.isFrozen = frozenOrNot;
                return freezeStatusDto;
            } else {
                this.logger.warn({coworking_id: coworkingId}, 'Coworking not found (freeze status changing');
                throw new NotFoundException("No such coworking");
            }

        } catch (error: any) {
            this.logger.error({error, coworking_id: coworkingId}, 'Unexpected error while changing freeze status');
            if (error.code === 'P2025') {
                this.logger.warn({coworking_id: coworkingId}, 'Coworking not found');
                throw new NotFoundException("Coworking not found");
            }
            this.logger.error({error, coworking_id: coworkingId}, 'Failed to update freeze status');
            throw new InternalServerErrorException("Failed to update freeze status");
        }
    }

    async getCoworkingsList() {
        try {
            const coworkings = await this.coworkingRepository.findAllCoworkingSpaces();
            const result: CoworkingResponseDto[] = [];
            for (const c of coworkings) {
                const dto = new CoworkingResponseDto();
                dto.id = c.id;
                dto.name = c.name;
                dto.description = c.description;
                dto.location = c.location;
                dto.priceForDay = Number(c.price_for_day);
                dto.priceForMonth = Number(c.price_for_month);
                result.push(dto);
            }

            return result;
        } catch (error) {
            this.logger.error({error}, 'Error while getting coworking list');
            throw new InternalServerErrorException("Error while getting coworking list");
        }
    }

    async getCoworking(coworkingId: string) {
        try {
            const coworking = await this.coworkingRepository.findCoworkingById(coworkingId);

            if (!coworking) {
                this.logger.warn({coworking_id: coworkingId}, 'Coworking not found');
                throw new NotFoundException("Coworking not found");
            }

            const result = new CoworkingResponseDto();
            result.id = coworking.id;
            result.name = coworking.name;
            result.description = coworking.description;
            result.location = coworking.location;
            result.priceForDay = Number(coworking.price_for_day);
            result.priceForMonth = Number(coworking.price_for_month);
            return result;

        } catch (error) {
            this.logger.error({error, coworking_id: coworkingId}, 'Error while getting coworking by id');
            throw new InternalServerErrorException("Error while getting coworking by ID");
        }
    }

    async getCoworkingInfoForBookingOperation(coworkingId: string) {
        if (!coworkingId) {
            this.logger.warn('Coworking ID is missing (booking info for booking operation)');
            throw new BadRequestException("Coworking ID is required to make info request");
        }

        const coworking = await this.coworkingRepository.getCoworkingInfoForBookingSpot(coworkingId);
        if (!coworking) {
            this.logger.warn({coworking_id: coworkingId}, 'Coworking not found (get booking info)');
            throw new NotFoundException("Coworking not found");
        }

        try {
            const totalSpots = await this.spotRepository.countTotalSpots(coworkingId);
            const availableSpots = await this.spotRepository.countAvailableSpots(coworkingId);
            return new CoworkingInfoDto(
                coworking.id,
                coworking.isFrozen,
                totalSpots,
                availableSpots,
                coworking.price_for_day.toNumber(),
                coworking.price_for_month.toNumber()
            );
        } catch (error) {
            this.logger.error({error, coworking_id: coworkingId}, 'Error while getting booking info');
            throw new InternalServerErrorException("Error while getting coworking booking info");
        }
    }
}

// ПРИЗМА:
// P2002 - проблема уникального поля
// P2005 - невалидное значение поля
// P2025 - запись не найдена