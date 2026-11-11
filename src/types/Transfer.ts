import { z } from "zod";

export const transferSchema = z.object({
    id: z.number(),
    sourceWalletId: z.coerce.number().int().positive("Carteira de origem é obrigatória"),
    destinationWalletId: z.coerce.number().int().positive("Carteira de destino é obrigatória"),
    amount: z.coerce.number().positive("Valor deve ser positivo"),
    date: z.string().date("Data inválida"),
    description: z.string().nullable().optional(),
    workspaceId: z.coerce.number(),
    createdAt: z.coerce.date().optional(),
});

export const createTransferSchema = transferSchema
    .omit({ id: true, createdAt: true })
    .refine((data) => data.sourceWalletId !== data.destinationWalletId, {
        message: "A carteira de destino deve ser diferente da carteira de origem",
        path: ["destinationWalletId"],
    });

export type Transfer = z.infer<typeof transferSchema>;
export type CreateTransferRequest = z.infer<typeof createTransferSchema>;

