import { AppError } from "./errors";

interface ResolvePaymentInput {
    date?: string | null;
    paid?: boolean;
    walletId?: number | null;
    isRecurring?: boolean;
}

interface ResolvedPayment {
    date: string | null;
    paid: boolean;
    walletId: number | null;
}

export function resolvePayment(input: ResolvePaymentInput): ResolvedPayment {
    if (input.isRecurring) {
        return {
            date: null,
            paid: false,
            walletId: input.walletId ?? null,
        };
    }

    const paid = Boolean(input.date) || Boolean(input.paid);

    if (paid && !input.walletId) {
        throw new AppError(400, "Carteira é obrigatória para transações pagas ou recebidas");
    }

    return {
        date: input.date ?? null,
        paid,
        walletId: input.walletId ?? null,
    };
}
