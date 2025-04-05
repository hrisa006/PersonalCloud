# Full Stack App (Frontend + Backend with Docker Compose)

This project includes both frontend and backend services, each containerized with Docker. It’s structured for seamless local development using Docker Compose.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express (TypeScript)
- **Environment**: Docker & Docker Compose

---

## 📦 Requirements

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- Optional: [Node.js](https://nodejs.org/) — if you want to run the app locally without Docker

---

## 🚀 Quick Start

1. **Clone the repository**  
   Navigate to the root directory.

2. **Add environment files**  
   Ensure the following files exist:

    - `./backend/.env`
    - `./frontend/.env`

   Example contents:

   ```env
   API_PORT=8081
   WEB_PORT=5173
   ```

3. **Start services with Docker Compose**

   ```bash
   docker-compose up --build
   ```

This will:
- Build and run both frontend and backend containers
- Respect environment port mappings
- Ensure backend starts before frontend

---

## 🧩 Docker Compose Overview

### `backend` service

- Builds from `./backend`
- Exposes `${API_PORT}` (e.g. 8081)
- Uses `.env` from `./backend/.env`

### `frontend` service

- Builds from `./frontend`
- Depends on `backend`
- Exposes `${WEB_PORT}` (e.g. 5173)
- Uses `.env` from `./frontend/.env`

---

## 🧪 Sample Tests

### API Test (Backend)

```bash
curl http://localhost:8081/api/test
```

### Frontend Test

Open your browser and go to:

```
http://localhost:5173
```

---

## 🛠 Common Docker Commands

**See running containers:**

```bash
docker ps
```

**Stop all containers:**

```bash
docker-compose down
```

**Rebuild and restart everything:**

```bash
docker-compose up --build
```

---

## 🧰 Optional: Run Locally Without Docker

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📌 Notes

- Environment variables must match across `.env` and `docker-compose.yml`
- Make sure the ports (`API_PORT`, `WEB_PORT`) are not in use by other applications

---
