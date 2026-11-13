import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiFetch } from '../util/apiFetch.js';

const BASE_URL = 'https://brapi.dev/api/v2';

@Injectable()
export class BrapiClient {
  private readonly logger = new Logger(BrapiClient.name);
  private readonly token: string;

  constructor(
    private readonly apiFetch: ApiFetch,
    config: ConfigService,
  ) {
    // Fails at startup if BRAPI_TOKEN is missing (see the schema in AppModule).
    this.token = config.getOrThrow<string>('BRAPI_TOKEN');
  }

  // Free plan: 1 ticker per request.
  async getQuote(symbol: string) {
    const url = `${BASE_URL}/stocks/quote?symbols=${encodeURIComponent(symbol)}`;
    return this.apiFetch.fetch<unknown>(url, this.token);
  }
}
