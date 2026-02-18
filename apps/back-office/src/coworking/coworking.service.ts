import {Injectable} from '@nestjs/common';
import {CoworkingRepository} from "./infrastructure/repositories/coworking.repository";
import {SpotRepository} from "../spot/infrastructure/repositories/spot.repository";
import {AddCoworkingDto} from "./dto/add-coworking-dto";

@Injectable()
export class CoworkingService {
    private readonly coworkingRepository: CoworkingRepository;
    private readonly spotRepository: SpotRepository;

    constructor(coworkingRepository: CoworkingRepository, spotRepository: SpotRepository) {
        this.coworkingRepository = coworkingRepository;
        this.spotRepository = spotRepository;
    }

    async addCoworking(dto: AddCoworkingDto) {
        const coworking = await this.coworkingRepository.addCoworking({
            name: dto.name,
            description: dto.description,
            location: dto.location,
            price_for_day: dto.priceForDay,
            price_for_month: dto.priceForMonth
        });
        await this.spotRepository.addSpots({
            coworking_id: coworking.id,
            amount_of_spots: dto.amountOfSpots});

        return coworking;
    }
}
