export class HttpError extends Error {
    constructor(
        readonly status: number,
        readonly url: string,
        readonly retryAfterMs?: number,
    ) {
        super(`HTTP ${status} em ${url}`)
        this.name = 'HttpError'
    }
}
