import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsArray } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Academy Name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'contact@academy.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '123 Main St', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Country', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 'State', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: 'City', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: ['primary', 'secondary'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  schoolLevels?: string[];
}
