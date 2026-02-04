import {Roles} from "../enums/roles.enum";


export interface JwtPayload {
    id: string,
    role: Roles,
    bookedSpotId: string | null,
    emailVerified: boolean
}