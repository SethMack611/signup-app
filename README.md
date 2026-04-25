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