export type IncomeUpdate = {
    id: number;
    name: string;
    amount: number;
    date: string;
    due_date: string;
    wallet_id?: number;
    recurring_transaction_id?: number;
    update_rec?: boolean;
}