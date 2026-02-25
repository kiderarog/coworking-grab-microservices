export class PaymentResponseDto {
    status: string;
    userId: string;
    amount: number;
    message?: string;
    error?: string;
}