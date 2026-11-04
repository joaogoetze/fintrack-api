import { z } from "zod";

const categorySchema = z.object({
    id: z.number(),
    name: z.string().min(1, "Nome é obrigatório"),
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
    });

export const updateCategorySchema = categorySchema
    .pick({
        id: true,
        name: true,
    });

export type Category = z.infer<typeof categorySchema>;
export type CategoriesResponse = z.infer<typeof categoriesResponseSchema>;
export type CreateCategoryRequest = z.infer<typeof createCategorySchema>;
export type UpdateCategoryRequest = z.infer<typeof updateCategorySchema>;
