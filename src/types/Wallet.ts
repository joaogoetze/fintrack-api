import { z } from "zod";

const walletSchema = z.object({
    id: z.number(),
    name: z.string(),
    balance: z.coerce.number(),
    deletedAt: z.coerce.date().nullable(),
});

export const createWalletRequest = walletSchema.omit({ id: true, deletedAt: true });

export type CreateWalletInput = z.infer<typeof createWalletRequest>;



export const updateWalletRequest = walletSchema.omit({ id: true, deletedAt: true });

export type UpdateWalletInput = z.infer<typeof updateWalletRequest>;
