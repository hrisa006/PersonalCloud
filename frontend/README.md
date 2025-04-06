# Frontend (React + TypeScript + Vite + Docker)

This is the frontend service for the project, built with:
- React + TypeScript
- Vite (for fast development)
- Docker + Docker Compose (for local development)

## Requirements

- Docker: https://www.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Node.js (https://nodejs.org/) (if you want to run locally without Docker)

## Step-by-Step: Build and Run

1. **Install dependencies** (if running locally)
   ```bash
   npm install
   ```

2. **Build Docker image manually** (optional)
   ```bash
   docker build -t frontend .
   ```

3. **Run frontend via Docker Compose**
   ```bash
   docker-compose up --build
   ```

This will:
- Build and run the frontend container on port 5173
- Automatically start Vite in development mode

Access your frontend at: http://localhost:5173

## Docker Compose Overview

### frontend service
- Uses Dockerfile to build the React TypeScript app with Vite
- Port: 5173 (exposed locally)

## Docker Compose Configuration

In the *docker-compose.yml* file, the frontend service is set up as follows:
   ```yaml
   version: "3.8"

   services:
   frontend:
   build: .
   ports: - "5173:5173"
   volumes: - .:/app - /app/node_modules
   stdin_open: true
   tty: true
   ```

## Common Docker Commands

See running containers:
   ```bash
   docker ps
   ```
Stop all containers:
   ```bash
   docker-compose down
   ```
Rebuild and restart everything:
   ```bash
   docker-compose up --build
   ```

## Sample Test (Development Mode)

Test that the React app is running by visiting:
   ```bash
   http://localhost:5173
   ```

## Optional: Running Locally (Without Docker)

If you'd prefer to run the app locally without Docker:
1. **Install dependencies**
   ```bash
   npm install
   ```
   
2. **Start the Vite development server**
   ```bash
   npm run dev
   ```

The app will be accessible at: http://localhost:5173

## Notes

- Vite is used for fast development, which includes features like Hot Module Replacement (HMR).
- The default port for Vite is 5173, which is exposed in the Docker container.
- Make sure you have Docker and Docker Compose installed to run this setup locally or in a containerized environment.
