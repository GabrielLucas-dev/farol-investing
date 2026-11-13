import { Injectable } from "@nestjs/common";
import { BrapiClient } from "./brapi.CLIENT.js";

@Injectable()
export class BrapiService {
    constructor(private readonly brapiClient: BrapiClient) {}
    async getQuote(symbol: string) {
        return this.brapiClient.getQuote(symbol)
    }
}