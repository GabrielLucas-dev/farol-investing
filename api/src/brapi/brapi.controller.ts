import { Controller, Get } from "@nestjs/common";
import { IBOV_TICKERS } from '../util/ibov-tickers.js';
import { BrapiService } from "./brapi.service.js";

@Controller('brapi')
export class BrapiController {
    constructor(private readonly brapiService: BrapiService) {}

    @Get()
    async getQuotes() {
        const quotes = this.brapiService.getQuote(IBOV_TICKERS, 1)
        return quotes;
    }
}