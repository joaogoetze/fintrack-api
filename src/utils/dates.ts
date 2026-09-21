import { format } from "date-fns";

/**
 * Normaliza coluna DATE para o contrato da API: 'yyyy-MM-dd' | null.
 * - string 'yyyy-MM-dd' (caminho normal com o parser de database/index.ts) -> devolve como está
 * - string ISO com timestamp ('2026-09-10T00:00:00.000Z') -> corta no dia, sem conversão de timezone
 * - Date -> formata (fallback para ambientes sem o parser configurado)
 * - null/undefined/'' -> null
 */
export function formatDateOnly(value: string | Date | null | undefined): string | null {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "string") return value.slice(0, 10);
    return format(value, "yyyy-MM-dd");
}

/**
 * Aplica formatDateOnly em `date`/`dueDate` de uma linha já em camelCase
 * (saída do toCamel). Para retornos unitários (create/update/paid/delete)
 * seguirem o mesmo contrato 'yyyy-MM-dd' do GET.
 */
export function withDateOnly<T extends Record<string, any>>(row: T): T {
    if (!row) return row;
    return {
        ...row,
        date: formatDateOnly(row.date),
        dueDate: formatDateOnly(row.dueDate),
    };
}
