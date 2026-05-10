# Node.js CRUD API — CI/CD Pipeline Test App

A minimal but complete **Express REST API** for managing users.  
Designed to exercise every stage of the CI/CD pipeline.

---

## Quick Start

```bash
npm install
npm run dev        # dev server with auto-reload
npm start          # production start
```

Server runs on `http://localhost:3000`

---

## API Reference

### Health

| Method | Path      | Description  |
| ------ | --------- | ------------ |
| GET    | `/health` | Health check |

### Users

| Method | Path             | Description    |
| ------ | ---------------- | -------------- |
| GET    | `/api/users`     | List all users |
| GET    | `/api/users/:id` | Get user by ID |
| POST   | `/api/users`     | Create a user  |
| PUT    | `/api/users/:id` | Full update    |
| PATCH  | `/api/users/:id` | Partial update |
| DELETE | `/api/users/:id` | Delete user    |

### Request / Response

**Create user — POST /api/users**

```json
// Request body
{ "name": "Alice", "email": "alice@example.com", "role": "user" }

// 201 Response
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Validation rules:**

- `name` — required, min 2 characters
- `email` — required, valid email format
- `role` — optional, `"user"` (default) or `"admin"`

**Error response (422):**

```json
{
  "success": false,
  "errors": [
    { "field": "email", "message": "A valid email address is required." }
  ]
}
```

---

## Running Tests

```bash
# Unit tests (validation logic + store model)
npm run test:unit

# Integration tests (real HTTP through Express)
npm run test:integration

# E2E tests (Playwright against live server)
npm start &                    # terminal 1
npm run test:e2e               # terminal 2

# All tests
npm test
```

---

## Project Structure

```
src/
├── index.js                   ← Server boot
├── app.js                     ← Express app factory
├── controllers/
│   └── userController.js      ← CRUD logic
├── middleware/
│   └── validate.js            ← Request validation
├── models/
│   └── userStore.js           ← In-memory data store
└── routes/
    └── userRoutes.js          ← Route definitions

tests/
├── unit/
│   ├── validate.test.js       ← Middleware unit tests
│   └── userStore.test.js      ← Model unit tests
├── integration/
│   └── users.test.js          ← Supertest HTTP tests
└── e2e/
    └── users.spec.js          ← Playwright E2E tests
```

---

## What Each Test Layer Covers

| Layer       | Tool             | What it tests                                |
| ----------- | ---------------- | -------------------------------------------- |
| Unit        | Jest             | Validation logic, store methods in isolation |
| Integration | Jest + Supertest | Full HTTP request/response cycle             |
| E2E         | Playwright       | Live server, full user journey               |
