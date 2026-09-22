import { z } from "zod";

export const idParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export type IdParam = z.infer<typeof idParamSchema>;

export const monthParamSchema = z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/, "Mês inválido, use o formato yyyy-MM"),
});

export type MonthParam = z.infer<typeof monthParamSchema>;
