export function snakeToCamel(key: string): string {
    return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

export function toCamel<T = any>(row: Record<string, any> | null | undefined): T {
    if (!row) return row as T;
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
        result[snakeToCamel(key)] = value;
    }
    return result as T;
}

export function toCamelMany<T = any>(rows: Record<string, any>[]): T[] {
    if (!rows) return rows;
    return rows.map((row) => toCamel<T>(row));
}
