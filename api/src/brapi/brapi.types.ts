export interface BrapiQuoteData {
    shortName: string
    longName: string
    currency: string
    regularMarketPrice: number
    regularMarketDayHigh: number
    regularMarketDayLow: number
    regularMarketDayRange: string
    regularMarketChange: number
    regularMarketChangePercent: number
    regularMarketTime: string
    marketCap: number
    regularMarketVolume: number
    regularMarketPreviousClose: number
    regularMarketOpen: number
    fiftyTwoWeekRange: string
    fiftyTwoWeekLow: number
    fiftyTwoWeekHigh: number
    logourl: string
}

export interface BrapiQuote {
    requestedSymbol: string
    symbol: string
    changed: boolean
    data: BrapiQuoteData
}

export interface BrapiQuoteResponse {
    results: BrapiQuote[]
    requestedAt: string
    took: number
}

export interface BrapiQuotesResult {
    results: BrapiQuote[]
    failed: { symbol: string, reason: string }[]
}
