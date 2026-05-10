// tests/e2e/users.spec.js
// These tests run against a LIVE server (started before the test suite).
// In CI: the workflow starts the server with `npm start &` before running Playwright.
// Locally: run `npm start` in one terminal, then `npm run test:e2e` in another.

const { test, expect } = require("@playwright/test");

const BASE = "/api/users";
let createdId; // shared across tests in this file

// ── Health ────────────────────────────────────────────────────────────────────
test("health endpoint returns ok", async ({ request }) => {
  const res = await request.get("/health");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.status).toBe("ok");
});

// ── CREATE ────────────────────────────────────────────────────────────────────
test("creates a new user", async ({ request }) => {
  const res = await request.post(BASE, {
    data: {
      name: "E2E User",
      email: `e2e-${Date.now()}@test.com`,
      role: "user",
    },
  });
  expect(res.status()).toBe(201);
  const body = await res.json();
  expect(body.success).toBe(true);
  expect(body.data.name).toBe("E2E User");
  createdId = body.data.id;
});

// ── READ ALL ──────────────────────────────────────────────────────────────────
test("lists all users and includes created user", async ({ request }) => {
  const res = await request.get(BASE);
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.count).toBeGreaterThanOrEqual(1);
  expect(body.data.some((u) => u.id === createdId)).toBeTruthy();
});

// ── READ ONE ──────────────────────────────────────────────────────────────────
test("fetches single user by id", async ({ request }) => {
  const res = await request.get(`${BASE}/${createdId}`);
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.data.id).toBe(createdId);
});

// ── FULL UPDATE ───────────────────────────────────────────────────────────────
test("fully updates the user with PUT", async ({ request }) => {
  const res = await request.put(`${BASE}/${createdId}`, {
    data: {
      name: "Updated E2E User",
      email: `updated-${Date.now()}@test.com`,
      role: "admin",
    },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.data.name).toBe("Updated E2E User");
  expect(body.data.role).toBe("admin");
});

// ── PARTIAL UPDATE ────────────────────────────────────────────────────────────
test("partially updates the user with PATCH", async ({ request }) => {
  const res = await request.patch(`${BASE}/${createdId}`, {
    data: { name: "Patched Name" },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.data.name).toBe("Patched Name");
});

// ── VALIDATION ────────────────────────────────────────────────────────────────
test("rejects creation with invalid email (422)", async ({ request }) => {
  const res = await request.post(BASE, {
    data: { name: "Bad Email User", email: "not-an-email" },
  });
  expect(res.status()).toBe(422);
});

test("returns 404 for non-existent user", async ({ request }) => {
  const res = await request.get(`${BASE}/non-existent-uuid`);
  expect(res.status()).toBe(404);
});

// ── DELETE ────────────────────────────────────────────────────────────────────
test("deletes the user", async ({ request }) => {
  const res = await request.delete(`${BASE}/${createdId}`);
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.success).toBe(true);
});

test("confirms user is gone after deletion", async ({ request }) => {
  const res = await request.get(`${BASE}/${createdId}`);
  expect(res.status()).toBe(404);
});
