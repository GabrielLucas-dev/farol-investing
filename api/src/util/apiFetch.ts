import { Injectable } from "@nestjs/common";

@Injectable()
export class ApiFetch {
    async fetch<T>(url: string, token: string): Promise<T> {
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            signal: AbortSignal.timeout(10_000),
        })
        if(!res.ok) throw new Error(`HTTP ${res.status} em ${url}`)
        
        return (await res.json()) as T;
    }
}