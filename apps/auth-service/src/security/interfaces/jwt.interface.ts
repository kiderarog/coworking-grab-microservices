import {Roles} from "../enums/roles.enum";


export interface JwtPayload {
    id: string,
    email: string
    role: Roles,
    bookedSpotId: string | null,
    emailVerified: boolean,
}