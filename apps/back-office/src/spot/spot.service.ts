import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import {SpotRepository} from "./infrastructure/repositories/spot.repository";
import {CoworkingRepository} from "../coworking/infrastructure/repositories/coworking.repository";
import {InjectPinoLogger, PinoLogger} from "nestjs-pino";

@Injectable()
export class SpotService {
    private readonly spotRepository: SpotRepository;
    private readonly coworkingRepository: CoworkingRepository;
    @InjectPinoLogger(SpotService.name)
    private readonly logger: PinoLogger;

    constructor(spotRepository: SpotRepository, coworkingRepository: CoworkingRepository) {
        this.spotRepository = spotRepository;
        this.coworkingRepository = coworkingRepository;
    }

    async getAllSpotsByCoworkingId(coworkingId: string) {
        this.logger.info({coworking_id: coworkingId}, 'Getting all spots by coworking ID');
        if (!coworkingId) {
            this.logger.warn('Coworking ID is missing (getting spots operation)');
            throw new BadRequestException("Coworking ID is required to get the spots");
        }
        const coworking = await this.coworkingRepository.findCoworkingById(coworkingId);
        if (!coworking) {
            this.logger.warn({coworking_id: coworkingId}, `Coworking not found. Received ID: ${coworkingId}`);
            throw new NotFoundException("No such coworking");
        }
        try {
            const spots = await this.spotRepository.getSpotsByCoworkingId(coworkingId);
            this.logger.info({coworking_id: coworkingId, count: spots?.length}, `All spots ${spots.length} successfully got by coworkingId`);
            return spots;
        } catch (error) {
            this.logger.error({err: error, coworking_id: coworkingId}, 'Error while getting spots');
            throw new InternalServerErrorException("Error while getting spots for some coworking" + error);
        }
    }


    async bookSpot(coworkingId: string) {
        if (!coworkingId) {
            this.logger.error('Coworking ID is missing for booking some spot!');
            throw new BadRequestException("Coworking ID is required to get the spots");
        }

        const coworking = await this.coworkingRepository.findCoworkingById(coworkingId);
        if (!coworking) {
            this.logger.error({coworking_id: coworkingId}, 'Coworking not found while booking');
            throw new NotFoundException("No such coworking");
        }
        if (coworking.isFrozen) {
            this.logger.warn({coworking_id: coworkingId}, 'Attempt to book frozen coworking');
            throw new ConflictException("Coworking is frozen by administrator and unavailable to book spot");
        }
        try {
            const bookedSpot = await this.spotRepository.bookAvailableSpot(coworkingId);
            if (!bookedSpot) {
                this.logger.warn({coworking_id: coworkingId}, 'No free spots available');
                throw new ConflictException("No free spots for booking at this coworking space");
            }
            return bookedSpot;
        } catch (error) {
            this.logger.error({err: error, coworking_id: coworkingId}, 'Unexpected error while booking spot');
            throw new InternalServerErrorException("Unexpected internal error while booking spot: " + error);
        }
    }

    async releaseSpot(coworkingId: string) {
        if (!coworkingId) {
            this.logger.warn('Coworking ID is missing (releasing spots)');
            throw new BadRequestException("Coworking ID is required to release some spots");
        }
        try {
            await this.spotRepository.releaseSpotByExpiredBooking(coworkingId);
            this.logger.info({ coworking_id: coworkingId}, 'Expired spots released successfully');

        } catch (error: any) {
            this.logger.error({err: error, coworking_id: coworkingId}, 'Error while releasing spots');
            throw new InternalServerErrorException("Error while releasing " + coworkingId + "spots");
        }

    }
}
