import { Pool, types } from 'pg';

// DATE (OID 1082) -> string 'yyyy-MM-dd' em vez de JS Date.
// Sem isso o pg devolve Date (meia-noite UTC) e o res.json
// serializa como ISO com timestamp ("2026-09-10T00:00:00.000Z").
// Timestamps (timestamptz) continuam como Date — só DATE muda.
types.setTypeParser(1082, (val: string) => val);

export const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
});

pool.on("connect", () => {
    console.log("Connected to the database");
});