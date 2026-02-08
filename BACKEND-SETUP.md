# Backend Setup Guide

## Overview

This document provides instructions for setting up the 6 microservices backend architecture for the Multi-Academy School Management System.

## Services

1. **auth-service** (Port 3001) - ✅ Complete
2. **organization-service** (Port 3002) - In Progress
3. **user-service** (Port 3003) - Pending
4. **academic-service** (Port 3004) - Pending
5. **attendance-service** (Port 3005) - Pending
6. **financial-service** (Port 3006) - Pending

## Quick Start

### Prerequisites

```bash
# Use Node.js 22
nvm use 22

# Ensure you have MySQL and Redis running
mysql --version
redis-cli ping
```

### Installation

```bash
# Install all dependencies
cd backend
yarn install

# Or install per service
cd services/auth-service
yarn install
```

### Environment Setup

Each service has a `.env.example` file. Copy and configure:

```bash
cd services/auth-service
cp .env.example .env
# Edit .env with your database credentials
```

### Database Setup

1. Create master database:
```sql
CREATE DATABASE ma_sms_organizations;
```

2. Create auth database:
```sql
CREATE DATABASE ma_sms_auth;
```

3. Tenant databases will be created automatically by Organization Service.

### Running Services

```bash
# Start all services (from backend root)
yarn start:all

# Or start individually
cd services/auth-service
yarn start:dev
```

## Service Details

### Auth Service (Port 3001) ✅

**Status**: Complete

**Features**:
- User authentication (login, register)
- JWT token generation and refresh
- Password reset flow
- Session management with Redis
- Role-based access control foundation

**Endpoints**:
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/auth/me`

**Swagger**: http://localhost:3001/api/docs

### Organization Service (Port 3002)

**Status**: In Progress

**Features**:
- Organization CRUD
- Multi-tenancy management
- Onboarding URL generation
- School level configuration
- Tenant database routing

### User Service (Port 3003)

**Status**: Pending

**Features**:
- User profile management
- Role assignment
- Biometric profile management
- User transfers

### Academic Service (Port 3004)

**Status**: Pending

**Features**:
- Academic structure (years, terms, classes)
- Results and assessments
- Assignments
- Student attendance

### Attendance Service (Port 3005)

**Status**: Pending

**Features**:
- Staff sign-in/sign-out
- Face recognition
- Location verification
- Attendance tracking

### Financial Service (Port 3006)

**Status**: Pending

**Features**:
- Fee structure management
- Payment recording
- Billing
- Scholarships

## Architecture

Each service follows the same structure:

```
service-name/
├── src/
│   ├── main.ts              # Bootstrap
│   ├── app.module.ts        # Root module
│   ├── config/              # Configuration
│   ├── database/            # Database module
│   ├── redis/               # Redis module
│   ├── security/            # Security utilities
│   └── [feature-modules]/   # Business logic
├── package.json
├── tsconfig.json
└── .env.example
```

## Development

### Adding a New Service

1. Create service directory:
```bash
mkdir -p services/new-service
```

2. Copy structure from auth-service as template

3. Update package.json with service-specific dependencies

4. Configure port and database in .env

5. Implement business logic

### Testing

```bash
# Run tests for all services
yarn test:all

# Run tests for specific service
cd services/auth-service
yarn test
```

## Next Steps

1. Complete Organization Service setup
2. Complete remaining 4 services
3. Set up API Gateway
4. Configure service discovery
5. Set up monitoring and logging
