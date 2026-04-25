# 📋 Signup Form App

A full-stack web application demonstrating controlled React forms, real-time validation, async persistence, and DynamoDB GSI filtering — all running locally in Docker.

---

## 🛠️ Tech Stack

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![Node](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express)
![DynamoDB](https://img.shields.io/badge/DynamoDB-Local-4053D6?logo=amazon-dynamodb)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![Jest](https://img.shields.io/badge/Jest-29-C21325?logo=jest)

---

## ✨ Features

- **Controlled Form** — all inputs managed via a single `fields` state object
- **Real-Time Validation** — error messages appear instantly as the user types
- **Error Prevention** — Submit button stays disabled until all fields are valid (Nielsen's Heuristic #5)
- **Async Persistence** — 5-second simulated save with READY → SAVING → SUCCESS/ERROR status states
- **GSI Filtering** — "Filter by Category" dropdown queries a DynamoDB Global Secondary Index
- **Unit Tested** — 15 Jest tests with fully stubbed DynamoDB (no database needed to run tests)

---

## 🏗️ Architecture
┌─────────────────────────────────────────────┐
│              Docker Compose                  │
│                                             │
│  ┌──────────┐     ┌──────────────────────┐  │
│  │  Vite UI │────▶│   Express API        │  │
│  │ :5173    │     │   :3001              │  │
│  └──────────┘     └──────────┬───────────┘  │
│                              │              │
│                   ┌──────────▼───────────┐  │
│                   │  DynamoDB Local      │  │
│                   │  :8000               │  │
│                   └──────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │  DynamoDB Admin GUI  :8001           │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
---

## 🚀 Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 20+](https://nodejs.org/) (only needed to run tests locally)

### Run the App

```bash
git clone https://github.com/YOUR_USERNAME/signup-app.git
cd signup-app
docker compose up --build
```

Then open these in your browser:

| URL | What it is |
|-----|-----------|
| http://localhost:5173 | React UI |
| http://localhost:3001/health | API health check |
| http://localhost:8001 | DynamoDB Admin GUI |

### Stop the App

```bash
docker compose down
```

---

## 🧪 Running Tests

Tests run without Docker — no database needed.

```bash
cd api
npm install
npm test
```

Expected output: **15 tests passing**

---

## 📁 Project Structure
signup-app/
├── docker-compose.yml
├── README.md
├── api/
│   ├── app.js
│   ├── index.js
│   ├── dynamo.js
│   ├── Dockerfile
│   ├── routes/
│   │   └── signups.js
│   ├── scripts/
│   │   └── createTable.js
│   └── tests/
│       └── signups.test.js
└── ui/
├── Dockerfile
└── src/
├── App.jsx
└── components/
└── SignupForm.jsx

---

## 🎬 Demo

▶️ [Watch the demo video](https://YOUR_LOOM_LINK_HERE)

---

## 👤 Author

**Your Name**  
[LinkedIn](https://linkedin.com/in/YOUR_PROFILE) · [GitHub](https://github.com/YOUR_USERNAME)
