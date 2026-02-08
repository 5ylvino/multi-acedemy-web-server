# Multi-Academy School Management System - Backend

## Overview

This is the backend microservices architecture for the Multi-Academy School Management System (MA-SMS). The system consists of 6 independent microservices built with Nest.js, following a multi-tenant architecture with database-per-tenant isolation.

## Architecture

The backend consists of 6 microservices:

1. **Auth Service** - Authentication & Authorization
2. **Organization Service** - Multi-Tenancy & Organization Management
3. **User Service** - User Management
4. **Academic Service** - Academic Management
5. **Attendance Service** - Staff Attendance & Biometric
6. **Financial Service** - Financial Management

## Prerequisites

- Node.js >= 22.0.0
- Yarn >= 1.22.0
- MySQL >= 8.0
- Redis >= 6.0
- NVM (Node Version Manager)

## Setup

### 1. Install Dependencies

```bash
# Use Node.js 22
nvm use 22

# Install all dependencies
yarn install
```

### 2. Environment Configuration

Each service has its own `.env.example` file. Copy and configure:

```bash
# For each service
cd services/auth-service
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup

1. Create master database for Organization Service
2. Create shared auth database for Auth Service
3. Tenant databases will be created automatically by Organization Service

### 4. Redis Setup

Ensure Redis is running:
```bash
redis-server
```

### 5. Start Services

```bash
# Start all services
yarn start:all

# Or start individually
cd services/auth-service
yarn start:dev
```

## Service Ports

- Auth Service: `3001`
- Organization Service: `3002`
- User Service: `3003`
- Academic Service: `3004`
- Attendance Service: `3005`
- Financial Service: `3006`

## Development

### Running Individual Services

```bash
cd services/<service-name>
yarn start:dev
```

### Building Services

```bash
# Build all services
yarn build:all

# Build individual service
cd services/<service-name>
yarn build
```

### Linting

```bash
# Lint all services
yarn lint:all

# Lint individual service
cd services/<service-name>
yarn lint
```

## Project Structure

```
backend/
├── services/
│   ├── auth-service/          # Authentication & Authorization
│   ├── organization-service/  # Multi-Tenancy & Organization
│   ├── user-service/         # User Management
│   ├── academic-service/     # Academic Management
│   ├── attendance-service/   # Attendance & Biometric
│   └── financial-service/    # Financial Management
├── package.json
└── README.md
```

## Documentation

See `BACKEND-ARCHITECTURE.md` in the root directory for detailed architecture documentation.

## License

Private - Multi-Academy School Management System
# multi-acedemy-web-server
