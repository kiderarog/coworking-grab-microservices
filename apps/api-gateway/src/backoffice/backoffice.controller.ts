import {Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Req} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import axios from "axios";
import type {Request} from 'express';


@Controller('backoffice')
export class BackofficeController {
    private readonly BACK_OFFICE_SERVICE_URL: string;

    constructor(private readonly configService: ConfigService) {
        this.BACK_OFFICE_SERVICE_URL = configService.getOrThrow('BACK_OFFICE_SERVICE_URL');
    }

    @Get('coworkings')
    async getCoworkingSpacesList(@Req() req: Request) {
        try {
            const response = await axios.get(`${this.BACK_OFFICE_SERVICE_URL}/coworkings`,
                {
                    headers: {
                        Authorization: req.headers.authorization
                    }
                })
            return response.data;

        } catch (error: any) {

            if (error.response) {
                throw new HttpException(
                    error.response.data,
                    error.response.status,
                );
            }
            throw new HttpException('Gateway error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('coworkings/:id')
    async getCoworking(@Req() req: Request, @Param('id') id: string) {
        try {
            const response = await axios.get(`${this.BACK_OFFICE_SERVICE_URL}/coworkings/${id}`,
                {
                    headers: {
                        Authorization: req.headers.authorization
                    }
                })
            return response.data;

        } catch (error: any) {
            if (error.response) {
                throw new HttpException(error.response.data, error.response.status);
            }
            throw new HttpException('Gateway error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('coworkings')
    async createCoworking(@Req() req: Request, @Body() body: unknown) {
        try {
            const response = await axios.post(`${this.BACK_OFFICE_SERVICE_URL}/coworkings`,
                body,
                {
                    headers: {
                        Authorization: req.headers.authorization
                    }
                })

            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new HttpException(error.response.data, error.response.status);
            }
            throw new HttpException('Gateway error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('coworkings/:id/is-available')
    async isAvailableChecking(@Req() req: Request, @Param("id") id: string) {
        try {
            const response = await axios.get(`${this.BACK_OFFICE_SERVICE_URL}/coworkings/${id}/is-available`,
                {
                    headers: {
                        Authorization: req.headers.authorization
                    }
                })
            return response.data;

        } catch (error: any) {
            if (error.response) {
                throw new HttpException(error.response.data, error.response.status);
            }
            throw new HttpException('Gateway error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch('coworkings/:id')
    async updateCoworking(@Req() req: Request, @Param('id') id: string, @Body() body: unknown) {
        try {
            const response = await axios.patch(`${this.BACK_OFFICE_SERVICE_URL}/coworkings/${id}`,
                body, {
                    headers: {
                        Authorization: req.headers.authorization
                    }
                })
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new HttpException(error.response.data, error.response.status);
            }
            throw new HttpException('Gateway error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch('coworkings/:id/freeze')
    async changeFreezeStatus(@Req() req: Request, @Param('id') id: string) {
        try {
            const response = await axios.patch(`${this.BACK_OFFICE_SERVICE_URL}/coworkings/${id}/freeze`,
                {}, {
                    headers: {
                        Authorization: req.headers.authorization
                    }
                })
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new HttpException(error.response.data, error.response.status);
            }
            throw new HttpException('Gateway error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('spots/:id')
    async getAllSpotsByCoworkingId(@Req() req: Request, @Param('id') coworkingId: string) {
        try {
            const response = await axios.get(`${this.BACK_OFFICE_SERVICE_URL}/spots/${coworkingId}`, {
                headers: {
                    Authorization: req.headers.authorization
                }
            });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new HttpException(error.response.data, error.response.status);
            }
            throw new HttpException('Gateway error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('spots/:coworkingId/book')
    async bookSpot(@Req() req: Request, @Param('coworkingId') coworkingId: string) {
        try {
            const response = await axios.post(`${this.BACK_OFFICE_SERVICE_URL}/spots/${coworkingId}/book`, {}, {
                headers: {
                    Authorization: req.headers.authorization
                }
            });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new HttpException(error.response.data, error.response.status);
            }
            throw new HttpException('Gateway error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}