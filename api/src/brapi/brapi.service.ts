import { Injectable, Logger } from "@nestjs/common";
import { BrapiClient } from "./brapi.client.js";
import { HttpError } from "../util/httpError.js";
import type { BrapiQuote, BrapiQuotesResult } from "./brapi.types.js";

const MAX_RETRIES = 2
const DEFAULT_RETRY_DELAY_MS = 1_000
const BATCH_DELAY_MS = 300

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

@Injectable()
export class BrapiService {
    private readonly logger = new Logger(BrapiService.name);

    constructor(private readonly brapiClient: BrapiClient) {}

    async getQuote(symbols: string[], concurrency = 1): Promise<BrapiQuotesResult> {
        const results: BrapiQuote[] = []
        const failed: BrapiQuotesResult['failed'] = []

        for(let i = 0; i < symbols.length; i += concurrency) {
            if(i > 0) await sleep(BATCH_DELAY_MS)

            const batch = symbols.slice(i, i + concurrency)
            const settled = await Promise.allSettled(
                batch.map((s) => this.getQuoteWithRetry(s))
            );
            settled.forEach((r, idx) => {
                if(r.status === 'fulfilled') results.push(...r.value)
                else failed.push({ symbol: batch[idx], reason: String(r.reason) })
            })
        }

        return { results, failed }
    }

    // Tenta de novo apenas em 429, respeitando o Retry-After quando existir.
    private async getQuoteWithRetry(symbol: string): Promise<BrapiQuote[]> {
        for(let attempt = 0; ; attempt++) {
            try {
                const response = await this.brapiClient.getQuote(symbol)
                return response.results
            } catch(err) {
                const isRateLimit = err instanceof HttpError && err.status === 429
                if(!isRateLimit || attempt >= MAX_RETRIES) throw err

                const delay = err.retryAfterMs ?? DEFAULT_RETRY_DELAY_MS * (attempt + 1)
                this.logger.warn(`429 em ${symbol}; nova tentativa em ${delay}ms (${attempt + 1}/${MAX_RETRIES})`)
                await sleep(delay)
            }
        }
    }
}
