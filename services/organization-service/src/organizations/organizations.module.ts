import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { Organization } from './entities/organization.entity';
import { OnboardingUrl } from './entities/onboarding-url.entity';
import { OrganizationSchoolLevel } from './entities/organization-school-level.entity';
import { SecurityModule } from '../security/security.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, OnboardingUrl, OrganizationSchoolLevel]),
    SecurityModule,
    AuthModule,
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
