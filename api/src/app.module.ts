import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { BrapiModule } from './brapi/brapi.module.js';
import { ConfigModule } from '@nestjs/config';
import { z } from 'zod';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: z.object({
        BRAPI_TOKEN: z.string().min(1),
      }),
    }),
    BrapiModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
