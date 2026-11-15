import { Injectable } from "@nestjs/common";
import { BrapiClient } from "./brapi.client.js";

@Injectable()
export class BrapiService {
    constructor(private readonly brapiClient: BrapiClient) {}

    async getQuote(symbols: string[], concurrency = 5) {
        const results: unknown[] = []
        const failed: { symbol: string, reason: string }[] = []
        
        for(let i = 0; i < symbols.length; i += concurrency) {
            const batch = symbols.slice(i, i + concurrency)
            const settled = await Promise.allSettled(
                batch.map((s) => this.brapiClient.getQuote(s))
            );
            settled.forEach((r, idx) => {
                if(r.status === 'fulfilled') results.push(r.value)
                else failed.push({ symbol: batch[idx], reason: String(r.reason) })
            })
        }
        
        return { results, failed }
    }
}