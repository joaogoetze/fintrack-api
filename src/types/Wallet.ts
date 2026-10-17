import { z } from "zod";

const walletSchema = z.object({
    id: z.number(),
    name: z.string(),
    balance: z.coerce.number(),
    deletedAt: z.coerce.date().nullable(),
    workspaceId: z.coerce.number(),
});

const walletsResponseSchema = z.object({
    wallets: z.array(walletSchema),
    total: z.number()
});

export const createWalletSchema = walletSchema
    .pick({
        name: true,
        balance: true,
        workspaceId: true
    });

export const updateWalletSchema = walletSchema
    .pick({
        id: true, 
        name: true,
        balance: true,
    });

export const updateWalletValueSchema = updateWalletSchema
    .omit({ name: true})
    .extend({ operation: z.enum(["income", "expense"])});

export type Wallet = z.infer<typeof walletSchema>;
export type WalletsResponse = z.infer<typeof walletsResponseSchema>
export type CreateWalletRequest = z.infer<typeof createWalletSchema>;
export type UpdateWalletRequest = z.infer<typeof updateWalletSchema>;
export type UpdateWalletValueRequest = z.infer<typeof updateWalletValueSchema>;
