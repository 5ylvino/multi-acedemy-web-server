import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { SecurityModule } from './security/security.module';
import configuration from './config/configuration';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.development', '.env.production'],
    }),

    // Database
    DatabaseModule,

    // Feature Modules
    OrganizationsModule,
    SecurityModule,
  ],
})
export class AppModule {}
