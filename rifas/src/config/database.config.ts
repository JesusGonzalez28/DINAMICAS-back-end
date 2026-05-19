import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rifas_db',
  // FIX: apunta a archivos compilados en dist/, no hardcodea rutas de dev
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  // FIX: synchronize solo en development, NUNCA en producción
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  charset: 'utf8mb4',
  timezone: '-05:00',
});
