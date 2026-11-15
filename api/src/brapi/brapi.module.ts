import { Module } from '@nestjs/common';
import { BrapiService } from './brapi.service.js';
import { BrapiClient } from "./brapi.client.js";
import { BrapiController } from './brapi.controller.js';
import { ApiFetch } from '../util/apiFetch.js';

@Module({
  imports: [],
  controllers: [ BrapiController ],
  providers: [ BrapiService, BrapiClient, ApiFetch ],
})
export class BrapiModule {}
