import { z } from "zod";

const nullableAmount = z.preprocess(
    (val) => (val === "" || val === undefined ? null : val),
    z.coerce.number().nullable().optional()
);

const nullableMargin = z.preprocess(
    (val) => (val === "" || val === undefined ? null : val),
    z.coerce.number().min(0).max(100).nullable().optional()
);

const categorySchema = z.object({
    id: z.number(),
    name: z.string().min(1, "Nome é obrigatório"),
    estimatedAmount: z.coerce.number().nullable().optional(),
    marginPercent: z.coerce.number().nullable().optional(),
    deletedAt: z.coerce.date().nullable(),
    createdAt: z.coerce.date().optional(),
    workspaceId: z.coerce.number(),
});

const categoriesResponseSchema = z.object({
    categories: z.array(categorySchema),
    total: z.number()
});

export const createCategorySchema = categorySchema
    .pick({
        name: true,
        workspaceId: true
    })
    .extend({
        estimatedAmount: nullableAmount,
        marginPercent: nullableMargin,
    });

export const updateCategorySchema = categorySchema
    .pick({
        id: true,
        name: true,
    })
    .extend({
        estimatedAmount: nullableAmount,
        marginPercent: nullableMargin,
    });

export type Category = z.infer<typeof categorySchema>;
export type CategoriesResponse = z.infer<typeof categoriesResponseSchema>;
export type CreateCategoryRequest = z.infer<typeof createCategorySchema>;
export type UpdateCategoryRequest = z.infer<typeof updateCategorySchema>;
