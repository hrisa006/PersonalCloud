# Personal Cloud Backend (Express + TypeScript + PostgreSQL + Docker)

This is the backend service for the Personal Cloud project, built with:

- Node.js + Express (TypeScript)
- PostgreSQL (as a Docker service)
- Docker + Docker Compose (for local development)

---

## Requirements

- Docker: https://www.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Optional: Node.js (https://nodejs.org/) if you want to run locally without Docker

---

## Step-by-Step: Build and Run

1. Install dependencies (if running locally)

   npm install

2. Build Docker image manually (optional)

   docker build -t personal-cloud-backend .

3. Run PostgreSQL + Backend via Docker Compose

   docker-compose up --build

This will:
- Build and run the backend container on port 8081
- Start a PostgreSQL database container on port 5432
- Set up environment variables for DB connection

Access your API at: http://localhost:8081
---

## Docker Compose Overview

backend service
- Uses Dockerfile to build your Node.js + TypeScript server
- Port: 8081 (exposed locally)

db service
- Uses postgres:15 image
- Environment:
    - POSTGRES_USER=admin
    - POSTGRES_PASSWORD: password
     - POSTGRES_DB: personal_cloud
- Port: 5432 (accessible to backend)

---

## Environment Variables (in docker-compose.yml)

| Variable    | Value          |
|-------------|----------------|
| DB_HOST     | db             |
| DB_PORT     | 5432           |
| DB_USER     | admin          |
| DB_PASSWORD | password       |
| DB_NAME     | personal_cloud |

---

## Common Docker Commands

See running containers:

    docker ps

Stop all containers:

    docker compose down

Rebuild and restart everything:

    docker compose up --build

Access PostgreSQL from terminal:

    docker exec -it personal-cloud-backend-db-1 psql -U admin -d mydb

Tip: Run `docker ps` to check the actual container name.

---

## Sample API Test with cURL

Test GET /api/test:
    curl http://localhost:8081/api/test

---