import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import {SpotRepository} from "./infrastructure/repositories/spot.repository";
import {CoworkingRepository} from "../coworking/infrastructure/repositories/coworking.repository";

@Injectable()
export class SpotService {
    private readonly spotRepository: SpotRepository;
    private readonly coworkingRepository: CoworkingRepository;

    constructor(spotRepository: SpotRepository, coworkingRepository: CoworkingRepository) {
        this.spotRepository = spotRepository;
        this.coworkingRepository = coworkingRepository;
    }

    async getAllSpotsByCoworkingId(coworkingId: string) {
        if (!coworkingId) {
            throw new BadRequestException("Coworking ID is required to get the spots");
        }
        const coworking = await this.coworkingRepository.findCoworkingById(coworkingId);
        if (!coworking) {
            throw new NotFoundException("No such coworking");
        }
        try {
            return this.spotRepository.getSpotsByCoworkingId(coworkingId);
        } catch (error) {
            throw new InternalServerErrorException("Error while getting spots for some coworking" + error);
        }
    }


    async bookSpot(coworkingId: string) {
        if (!coworkingId) {
            throw new BadRequestException("Coworking ID is required to get the spots");
        }

        const coworking = await this.coworkingRepository.findCoworkingById(coworkingId);
        if (!coworking) {
            throw new NotFoundException("No such coworking");
        }
        if (coworking.isFrozen) {
            throw new ConflictException("Coworking is frozen by administrator and unavailable to book spot");
        }
        try {
            const bookedSpot = await this.spotRepository.bookAvailableSpot(coworkingId);
            if (!bookedSpot) {
                throw new ConflictException("No free spots for booking at this coworking space");
            }
            return bookedSpot;
        } catch (error) {
            throw new InternalServerErrorException("Unexpected internal error while booking spot: " + error);
        }
    }
}
