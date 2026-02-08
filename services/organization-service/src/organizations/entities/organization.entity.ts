import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { OnboardingUrl } from './onboarding-url.entity';
import { OrganizationSchoolLevel } from './organization-school-level.entity';

@Entity('organizations')
@Index(['email'])
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  city: string;

  @Column({ default: false })
  onboardingCompleted: boolean;

  @Column({ default: 'active' })
  status: string;

  @OneToMany(() => OnboardingUrl, (onboardingUrl) => onboardingUrl.organization)
  onboardingUrls: OnboardingUrl[];

  @OneToMany(() => OrganizationSchoolLevel, (schoolLevel) => schoolLevel.organization)
  schoolLevels: OrganizationSchoolLevel[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
