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

## Common Docker Commands

See running containers:

    docker ps

Stop all containers:

    docker compose down

Rebuild and restart everything:

    docker compose up --build

Access PostgreSQL from terminal:

    docker exec -it personal-cloud-backend-db-1 psql -U admin -d mydb

---

## API

### File endpoint - [Postman Collection](../documentation/file-endpoint-postman-collection.json)

| Endpoint    | HTTP Verb  | Description                                          |
|-------------|------------|------------------------------------------------------|
| **`/file`** | **POST**   | Uploads a new file.                                  |
| **`/file`** | **PUT**    | Updates an existing file (removes old, uploads new). |
| **`/file`** | **DELETE** | Removes a file from the server.                      |
| **`/file`** | **GET**    | Downloads a file.                                    |

---

#### 1. POST `/file?filePath=<some/path>`

- **Description**: Uploads a file (or files) to the server at the specified `filePath` (optional).
- **Body**: Must be `multipart/form-data`; include one file field (e.g., `file`).

---

#### 2. PUT `/file?filePath=<some/path/file.ext>`

- **Description**: Removes the existing file at `filePath` and uploads a new file in its place.
- **Body**: Must be `multipart/form-data`; include at least one file field (e.g., `file`).

---

#### 3. DELETE `/file?filePath=<some/path/file.ext>`

- **Description**: Deletes a file at the specified `filePath`.

---

#### 4. GET `/file?filePath=<some/path/file.ext>`

- **Description**: Initiates a download of the file located at `filePath`.
- **Response**: Returns the raw file as the response body.

---

#### Errors

These errors are triggered by issues with the client’s request. For example:
- **Invalid File Path**: The provided `filePath` contains illegal characters (e.g., `..` or backslashes).
- **File Not Found**: The specified file does not exist on the server.
- **Parsing Errors**: Issues parsing the file during upload or update, such as missing or malformed file data.
- **Server Errors**: System related failures

#### Example Response
```json
{
  "status": 400,
  "message": "Invalid file path"
}
```
---