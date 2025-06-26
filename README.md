# Vechos Utils

A collection of utilities for Angular and Node.js applications, including JWT management, MongoDB services, custom error handling, and more.

## Installation

```bash
npm install vecholib
# or
bun add vecholib
```

## Usage

### Complete import

```typescript
import { client, server } from 'vecholib';
```

### Individual imports

```typescript
// Server utilities
import { services, errors } from 'vecholib/server';

// Client utilities (Angular)
import { directives } from 'vecholib/client';
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
} from 'vecholib/server/errors';

// Usage examples
throw new BadRequestError('Invalid request');
throw new NotFoundError(); // "Route non trovata"
throw new NotAuthorizedError(); // "Non sei autorizzato"
throw new DatabaseConnectionError(); // "Errore durante la connessione al database"
throw new RequiredEnvVariableError('DATABASE_URL');
throw new TokenExpiredError(); // "Il token di accesso è scaduto"

// Generic error handling
const gem = GenericErrorHandlerManager.init(logManager);
await riskyFunction().catch(gem.handleError);
```

### Services

#### JWT Management

```typescript
import { services } from 'vecholib/server';

const jwtManager = new services.jwt.JWTManager('JWT_SECRET_KEY');

// Sign a token
const token = jwtManager.signToken({ userId: 123 }, '7d');

// Verify a token
const payload = jwtManager.verifyToken<{ userId: number }>(token);

// Check for invalid token
console.log(services.jwt.JWTManager.INVALID_JWT_TOKEN); // "Errore durante la validazione del token. Riprova."
```

#### Environment Variables Management

```typescript
import { services } from 'vecholib/server';

// Declare required environment variables
const env = services.envs.declareEnvs(['DATABASE_URL', 'JWT_SECRET']);
const { DATABASE_URL, JWT_SECRET } = env;

// Check if we're in production
if (services.envs.isProduction()) {
  console.log('Production environment');
}
```

#### Logging System

```typescript
import { services } from 'vecholib/server';

// Simple logging
services.logs.log('Success message', 'success');
services.logs.log('Information', 'info');
services.logs.log('Critical error', 'error');
services.logs.log('Application startup', 'start');
services.logs.log('Warning', 'warning');
services.logs.log('Operation completed', 'end');

// Log Manager with cache
const logManager = services.logs.LogManager.init(['ignore-this'], 100);
logManager.log('Message', 'info');
console.log(logManager.logs); // Get recent logs
```

#### MongoDB Database Connection

```typescript
import { services } from 'vecholib/server';

const logManager = services.logs.LogManager.init();
await services.db.connectToDatabase(logManager);
```

## Client Utilities (Angular)

### Angular Directives

The project includes ready-to-use Angular directives (currently in development).

```typescript
import { directives } from 'vecholib/client';
// Directives are available but need to be implemented
```

## All Available Imports

### Server Side

```typescript
// Complete server import
import { server } from 'vecholib';

// Services
import { services } from 'vecholib/server';
import { db, envs, jwt, logs } from 'vecholib/server/services';

// Errors
import { errors } from 'vecholib/server';
import { 
  CustomError,
  BadRequestError,
  DatabaseConnectionError,
  GenericErrorHandlerManager,
  NotAuthorizedError,
  NotFoundError,
  RequestValidationError,
  RequiredEnvVariableError,
  TokenExpiredError
} from 'vecholib/server/errors';

// Individual services
import { log, LogManager } from 'vecholib/server/services/logs';
import { JWTManager, INVALID_JWT_TOKEN } from 'vecholib/server/services/jwt';
import { declareEnvs, isProduction } from 'vecholib/server/services/envs';
import { connectToDatabase } from 'vecholib/server/services/db';
import { genericErrorHandler, GenericErrorHandlerManager } from 'vecholib/server/errors/generic-error-handler';
```

### Client Side

```typescript
// Complete client import
import { client } from 'vecholib';

// Angular utilities
import { directives } from 'vecholib/client';
```

## Project Structure

```
vecholib/
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
import { server } from 'vecholib';

const app = express();
const logManager = server.services.logs.LogManager.init();

// Database connection
await server.services.db.connectToDatabase(logManager);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof server.errors.CustomError) {
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
import { server } from 'vecholib';

const jwtManager = new server.services.jwt.JWTManager('JWT_SECRET');

// Authentication middleware
const requireAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new server.errors.NotAuthorizedError();
    }
    
    const payload = jwtManager.verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};
```

### Error Handling with Logging

```typescript
import { server } from 'vecholib';

const logManager = server.services.logs.LogManager.init(['sensitive-data'], 50);
const errorHandler = server.errors.GenericErrorHandlerManager.init(logManager);

// Example usage
async function riskyOperation() {
  // Some operation that might fail
  throw new Error('Something went wrong');
}

await riskyOperation().catch(errorHandler.handleError);
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
bun run dev

# Build
bun run build

# Run tests
bun run test

# Lint and format
bun run lint:fix
bun run format:fix
```

## License

MIT