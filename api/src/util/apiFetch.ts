import { Injectable } from "@nestjs/common";
import { HttpError } from "./httpError.js";

@Injectable()
export class ApiFetch {
    async fetch<T>(url: string, token: string): Promise<T> {
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            signal: AbortSignal.timeout(10_000),
        })
        if(!res.ok) {
            // Retry-After vem em segundos (ou como data HTTP, que ignoramos).
            const seconds = Number(res.headers.get('retry-after'))
            const retryAfterMs = Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : undefined
            throw new HttpError(res.status, url, retryAfterMs)
        }

        return (await res.json()) as T;
    }
}
