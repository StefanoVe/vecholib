# Vechos Utils

A collection of utilities for Angular and Node.js applications, including JWT management, MongoDB services, custom error handling, and more.

## Installation

```bash
npm install vechos-utils
# or
bun add vechos-utils
```

## Usage

### Complete import

```typescript
import { client, server } from 'vechos-utils';
```

## Server Utilities

### Error Handling

Complete custom error handling system for Express/Node.js applications.

```typescript
import { 
  CustomError, 
  BadRequestError, 
  NotFoundError, 
  NotAuthorizedError, 
  DatabaseConnectionError, 
  RequiredEnvVariableError, 
  RequestValidationError,
  TokenExpiredError,
  GenericErrorHandlerManager
} from 'vechos-utils/server';

// Usage examples
throw new BadRequestError('Invalid request');
throw new NotFoundError(); // "Route not found"
throw new NotAuthorizedError(); // "You are not authorized"
throw new DatabaseConnectionError(); // "Error connecting to database"
throw new RequiredEnvVariableError('DATABASE_URL');
throw new TokenExpiredError(); // "Access token has expired"

// Generic error handling
const gem = GenericErrorHandlerManager.init(logManager);
await riskyFunction().catch(gem.handleError);
```

### Services

#### JWT Management

```typescript
import { jwt } from 'vechos-utils/server';

const jwtManager = new jwt.JWTManager('JWT_SECRET_KEY');

// Sign a token
const token = jwtManager.signToken({ userId: 123 }, '7d');

// Verify a token
const payload = jwtManager.verifyToken<{ userId: number }>(token);
```

#### Environment Variables Management

```typescript
import { envs } from 'vechos-utils/server';

// Declare required environment variables
const { DATABASE_URL, JWT_SECRET } = envs.declareEnvs(['DATABASE_URL', 'JWT_SECRET']);

// Check if we're in production
if (envs.isProduction()) {
  console.log('Production environment');
}
```

#### Logging System

```typescript
import { logs } from 'vechos-utils/server';

// Simple logging
logs.log('Success message', 'success');
logs.log('Information', 'info');
logs.log('Critical error', 'error');
logs.log('Application startup', 'start');
logs.log('Warning', 'warning');
logs.log('Operation completed', 'end');

// Log Manager with cache
const logManager = logs.LogManager.init(['ignore-this'], 100);
logManager.log('Message', 'info');
console.log(logManager.logs); // Get recent logs
```

#### MongoDB Database Connection

```typescript
import { db, logs } from 'vechos-utils/server';

const logManager = logs.LogManager.init();
await db.connectToDatabase(logManager);
```

## Client Utilities (Angular)

### Angular Directives

The project includes ready-to-use Angular directives (currently in development).

```typescript
import { /* directives */ } from 'vechos-utils/client';
```

## Project Structure

```
vechos-utils/
├── src/
│   ├── server/           # Server-side utilities
│   │   ├── errors/       # Error handling system
│   │   └── services/     # Services (JWT, DB, Logs, Env)
│   └── client/           # Client-side utilities
│       └── angular/      # Angular components and directives
```

## Complete Examples

### Express Server Setup

```typescript
import express from 'express';
import { server } from 'vechos-utils';

const app = express();
const logManager = server.logs.LogManager.init();

// Database connection
await server.db.connectToDatabase(logManager);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof server.CustomError) {
    return res.status(err.statusCode).json({
      errors: err.serializeErrors()
    });
  }
  
  res.status(500).json({
    errors: [{ message: 'Internal server error' }]
  });
});
```

### JWT Authentication Management

```typescript
import { server } from 'vechos-utils';

const jwtManager = new server.jwt.JWTManager('JWT_SECRET');

// Authentication middleware
const requireAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new server.NotAuthorizedError();
    }
    
    const payload = jwtManager.verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};
```

## Requirements

- Node.js >= 18
- TypeScript >= 5.0
- For Angular utilities: Angular >= 15

## Development

```bash
# Install dependencies
bun install

# Development mode
bun run dry

# Build
bun run build
```

## License

MIT

