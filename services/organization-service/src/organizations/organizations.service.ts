import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { OnboardingUrl } from './entities/onboarding-url.entity';
import { OrganizationSchoolLevel } from './entities/organization-school-level.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { SecurityService } from '../security/security.service';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(OnboardingUrl)
    private onboardingUrlRepository: Repository<OnboardingUrl>,
    @InjectRepository(OrganizationSchoolLevel)
    private schoolLevelRepository: Repository<OrganizationSchoolLevel>,
    private securityService: SecurityService,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    // Check if organization with email already exists
    const existing = await this.organizationRepository.findOne({
      where: { email: createOrganizationDto.email },
    });

    if (existing) {
      throw new BadRequestException('Organization with this email already exists');
    }

    const organization = this.organizationRepository.create({
      name: createOrganizationDto.name,
      email: createOrganizationDto.email,
      phone: createOrganizationDto.phone,
      address: createOrganizationDto.address,
      country: createOrganizationDto.country,
      state: createOrganizationDto.state,
      city: createOrganizationDto.city,
      onboardingCompleted: false,
      status: 'active',
    });

    const savedOrganization = await this.organizationRepository.save(organization);

    // Create school levels if provided
    if (createOrganizationDto.schoolLevels && createOrganizationDto.schoolLevels.length > 0) {
      const schoolLevels = createOrganizationDto.schoolLevels.map((level) =>
        this.schoolLevelRepository.create({
          organizationId: savedOrganization.id,
          schoolLevel: level,
          isActive: true,
        }),
      );

      await this.schoolLevelRepository.save(schoolLevels);
    }

    return savedOrganization;
  }

  async findAll(): Promise<Organization[]> {
    return this.organizationRepository.find({
      relations: ['schoolLevels', 'onboardingUrls'],
    });
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['schoolLevels', 'onboardingUrls'],
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    const organization = await this.findOne(id);

    Object.assign(organization, updateOrganizationDto);
    return this.organizationRepository.save(organization);
  }

  async remove(id: string): Promise<void> {
    const organization = await this.findOne(id);
    await this.organizationRepository.remove(organization);
  }

  async generateOnboardingUrl(organizationId: string): Promise<{ url: string; token: string }> {
    const organization = await this.findOne(organizationId);

    // Generate secure token
    const token = this.securityService.generateSecureToken(64);
    const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding/school/${token}`;

    // Create onboarding URL
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

    const onboardingUrl = this.onboardingUrlRepository.create({
      organizationId: organization.id,
      token,
      url,
      isActive: true,
      expiresAt,
    });

    await this.onboardingUrlRepository.save(onboardingUrl);

    return { url, token };
  }

  async getOrganizationByOnboardingToken(token: string): Promise<Organization> {
    const onboardingUrl = await this.onboardingUrlRepository.findOne({
      where: { token, isActive: true },
      relations: ['organization', 'organization.schoolLevels'],
    });

    if (!onboardingUrl) {
      throw new NotFoundException('Invalid or expired onboarding token');
    }

    if (onboardingUrl.expiresAt && onboardingUrl.expiresAt < new Date()) {
      throw new NotFoundException('Onboarding token has expired');
    }

    if (onboardingUrl.usedAt) {
      throw new BadRequestException('This onboarding link has already been used');
    }

    return onboardingUrl.organization;
  }

  async markOnboardingUrlAsUsed(token: string): Promise<void> {
    const onboardingUrl = await this.onboardingUrlRepository.findOne({
      where: { token },
    });

    if (onboardingUrl) {
      onboardingUrl.usedAt = new Date();
      await this.onboardingUrlRepository.save(onboardingUrl);
    }
  }
}
