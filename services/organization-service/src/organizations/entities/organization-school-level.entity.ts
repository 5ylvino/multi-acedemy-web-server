import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Organization } from './organization.entity';

@Entity('organization_school_levels')
@Index(['organizationId', 'schoolLevel'])
export class OrganizationSchoolLevel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.schoolLevels)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  schoolLevel: string; // 'primary', 'secondary', 'university', 'nursery'

  @Column({ default: true })
  isActive: boolean;

  @Column('text', { nullable: true })
  config: string; // JSON config

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
