# API Skeleton with TypeScript and Express

## Overview

**API Skeleton with TypeScript and Express** is a boilerplate designed to help developers build secure and scalable APIs quickly. This project serves as a foundation for creating MVPs with minimal setup and maximum efficiency.

### Features:

- **TypeScript** for strong typing and better maintainability.
- **Express.js** as the web framework.
- **Docker Compose** for simplified environment setup.
- **Redis** for caching to optimize performance.
- **Husky** and **ESLint** for code quality and consistency.
- **CLI tool** for generating essential components like modules, CRUDs, and APIs.
- Built-in **documentation system** with support for public and admin routes.

---

## Getting Started

### Prerequisites

Ensure the following tools are installed:

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/) (if running locally)
- [Redis](https://redis.io/) (if not using Docker)
- [MySQL](https://www.mysql.com/) (if not using Docker)

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repository/api-skeleton-ts.git
   cd api-skeleton-ts
   ```

2. Create a .env file in the root directory with the following structure:

   ```env
    PORT=8080
    SECRET_KEY=secret
    MYSQL_DATABASE=data_base
    MYSQL_USER=
    MYSQL_PASS=
    MYSQL_HOST=
    MYSQL_PORT=3306

    NODE_ENV=development

    REDIS_PASSWORD=""
    REDIS_PORT=6379
    REDIS_HOST=
    REDIS_DATABASE=0

    LOCAL=true
   ```

3. Start the project using Docker Compose:

- For Development:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

* For Production:
   ```bash
   docker-compose -f docker-compose.yml up --build
   ```

---

### CLI Commands

The project includes a CLI tool to speed up API development. Commands include:

1. Generate a Module:

```bash
npm run generate-model <name>
```

2. Generate CRUD:

```bash
npm run generate-crud <name>
```

3. Generate API:

```bash
npm run generate-api
```

---

### Commands

| Command                  | Description                                                             |
| ------------------------ | ----------------------------------------------------------------------- |
| `npm run dev`            | Start the server in development mode with Nodemon.                      |
| `npm run build`          | Build the project using TypeScript.                                     |
| `npm run test`           | Run tests with Jest.                                                    |
| `npm run lint`           | Lint the code using ESLint.                                             |
| `npm run format`         | Format the code with Prettier.                                          |
| `npm run pretty`         | Format TypeScript files with Prettier.                                  |
| `npm run prepare`        | Install Husky for pre-commit hooks.                                     |
| `npm run pre-commit`     | Run lint-staged before committing changes.                              |
| `npm run generate-api`   | Generate an API component with routes, controllers, DTOs, and services. |
| `npm run generate-crud`  | Generate CRUD operations using Sequelize for a specified model.         |
| `npm run generate-model` | Generate models in the DAO folder.                                      |

---

### Project Structure

```plaintext
src/
├── api/               # API routes
│   ├── admin/         # Protected routes (e.g., admin dashboard)
│   └── public/        # Public routes (e.g., e-commerce)
├── config/            # Configuration files
│   ├── database.ts    # MySQL database connection
│   ├── environment.ts # Environment variable handling
│   ├── redisManager.ts# Redis connection and management
│   └── storeProcedures/ # MySQL stored procedures
├── dao/               # Data Access Objects (models)
├── middlewares/       # Express middlewares
├── utils/             # Utility functions
├── app.ts             # Server class with configurations
└── server.ts          # Server instance
documentation/
├── admin.json         # Admin route documentation
└── public.json        # Public route documentation

```
