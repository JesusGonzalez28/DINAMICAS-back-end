import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { RafflesModule } from './raffles/raffles.module';
import { PurchasesModule } from './purchases/purchases.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    // Carga las variables de entorno globalmente
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexión a la DB
    TypeOrmModule.forRootAsync({
      useFactory: () => databaseConfig(),
    }),

    AuthModule,
    RafflesModule,
    PurchasesModule,
    SettingsModule,
  ],
})
export class AppModule {}
