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
        host: config.get<string>('database.host', 'localhost'),
        port: config.get<number>('database.port', 3306),
        username: config.get<string>('database.username', 'root'),
        password: config.get<string>('database.password', ''),
        database: config.get<string>('database.database', 'organization_db'),
        entities: [join(__dirname, '**/*.entity{.ts,.js}')],
        synchronize: true,
        logging: true,
        timezone: 'Z',
        charset: 'utf8mb4',
      }),
    }),
  ],
})
export class DatabaseModule {}
