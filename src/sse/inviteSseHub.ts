import { Response } from "express";

const HEARTBEAT_MS = 25_000;

class InviteSseHub {
    private clients = new Map<string, Set<Response>>();
    private heartbeats = new Map<string, ReturnType<typeof setInterval>>();

    subscribe(email: string, res: Response) {
        const key = email.toLowerCase().trim();
        let set = this.clients.get(key);
        if (!set) {
            set = new Set();
            this.clients.set(key, set);
        }
        set.add(res);
        this.ensureHeartbeat(key);
    }

    unsubscribe(email: string, res: Response) {
        const key = email.toLowerCase().trim();
        const set = this.clients.get(key);
        if (!set) return;

        set.delete(res);
        if (set.size === 0) {
            this.clients.delete(key);
            const timer = this.heartbeats.get(key);
            if (timer) {
                clearInterval(timer);
                this.heartbeats.delete(key);
            }
        }
    }

    publish(email: string) {
        const key = email.toLowerCase().trim();
        const set = this.clients.get(key);
        if (!set) return;

        for (const res of set) {
            this.write(res, "event: invite\ndata: {}\n\n");
        }
    }

    private ensureHeartbeat(key: string) {
        if (this.heartbeats.has(key)) return;

        const timer = setInterval(() => {
            const set = this.clients.get(key);
            if (!set || set.size === 0) {
                clearInterval(timer);
                this.heartbeats.delete(key);
                return;
            }
            for (const res of set) {
                this.write(res, ": ping\n\n");
            }
        }, HEARTBEAT_MS);

        this.heartbeats.set(key, timer);
    }

    private write(res: Response, payload: string) {
        try {
            res.write(payload);
        } catch {
            // conexão já fechada
        }
    }
}

export const inviteSseHub = new InviteSseHub();
