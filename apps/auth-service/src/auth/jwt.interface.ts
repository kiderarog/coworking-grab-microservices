import { Role } from '../../generated/prisma/enums';


export interface JwtPayload {
  id: string,
  role: Role,
  bookedSpotId: string | null,
  emailVerified: boolean
}