import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { BrapiModule } from './brapi/brapi.module.js';
import { ConfigModule } from '@nestjs/config';
import { z } from 'zod';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: z.object({
        BRAPI_TOKEN: z.string().min(1),
      }),
    }),
    BrapiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
