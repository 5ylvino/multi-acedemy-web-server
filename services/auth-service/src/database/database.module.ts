import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.database'),
        entities: [join(__dirname, '**/*.entity{.ts,.js}')],
        synchronize: true,//config.get<boolean>('database.synchronize'),
        logging: true,//config.get<boolean>('database.logging'),
        timezone: 'Z',
        charset: 'utf8mb4',
      }),
    }),
  ],
})
export class DatabaseModule { }
