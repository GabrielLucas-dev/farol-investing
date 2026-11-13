import { Module } from '@nestjs/common';
import { BrapiService } from './brapi.service.js';
import { BrapiClient } from './brapi.CLIENT.js';
import { ApiFetch } from '../util/apiFetch.js';

@Module({
  imports: [],
  controllers: [],
  providers: [BrapiService, BrapiClient, ApiFetch],
})
export class BrapiModule {}
