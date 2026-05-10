// tests/integration/users.test.js
// Runs the real Express app end-to-end through HTTP but fully in-process.
const request = require("supertest");
const app = require("../../src/app");
const store = require("../../src/models/userStore");

beforeEach(() => store.clear());
afterAll(() => store.clear());

// ── Health ────────────────────────────────────────────────────────────────────
describe("GET /health", () => {
  test("returns 200 with status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

// ── GET /api/users ────────────────────────────────────────────────────────────
describe("GET /api/users", () => {
  test("returns empty list initially", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.count).toBe(0);
  });

  test("returns all users", async () => {
    store.create({ name: "Alice", email: "alice@test.com" });
    store.create({ name: "Bob", email: "bob@test.com" });

    const res = await request(app).get("/api/users");
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.data).toHaveLength(2);
  });
});

// ── POST /api/users ───────────────────────────────────────────────────────────
describe("POST /api/users", () => {
  test("creates a user and returns 201", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ name: "Alice", email: "alice@test.com" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      name: "Alice",
      email: "alice@test.com",
      role: "user",
    });
    expect(res.body.data.id).toBeDefined();
  });

  test("creates user with admin role", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ name: "Admin User", email: "admin@test.com", role: "admin" });

    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe("admin");
  });

  test("returns 409 on duplicate email", async () => {
    await request(app)
      .post("/api/users")
      .send({ name: "Alice", email: "dup@test.com" });
    const res = await request(app)
      .post("/api/users")
      .send({ name: "Alice 2", email: "dup@test.com" });

    expect(res.status).toBe(409);
  });

  test("returns 422 for missing name", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ email: "test@test.com" });
    expect(res.status).toBe(422);
    expect(res.body.errors.some((e) => e.field === "name")).toBe(true);
  });

  test("returns 422 for invalid email", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ name: "Alice", email: "bad-email" });
    expect(res.status).toBe(422);
  });
});

// ── GET /api/users/:id ────────────────────────────────────────────────────────
describe("GET /api/users/:id", () => {
  test("returns user by id", async () => {
    const user = store.create({ name: "Alice", email: "alice@test.com" });
    const res = await request(app).get(`/api/users/${user.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(user.id);
  });

  test("returns 404 for unknown id", async () => {
    const res = await request(app).get("/api/users/does-not-exist");
    expect(res.status).toBe(404);
  });
});

// ── PUT /api/users/:id ────────────────────────────────────────────────────────
describe("PUT /api/users/:id", () => {
  test("fully updates a user", async () => {
    const user = store.create({ name: "Old Name", email: "old@test.com" });
    const res = await request(app)
      .put(`/api/users/${user.id}`)
      .send({ name: "New Name", email: "new@test.com", role: "admin" });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      name: "New Name",
      email: "new@test.com",
      role: "admin",
    });
  });

  test("returns 404 for unknown id", async () => {
    const res = await request(app)
      .put("/api/users/bad-id")
      .send({ name: "X name", email: "x@test.com" });
    expect(res.status).toBe(404);
  });

  test("returns 409 when updating to an existing email", async () => {
    store.create({ name: "Bob", email: "bob@test.com" });
    const alice = store.create({ name: "Alice", email: "alice@test.com" });

    const res = await request(app)
      .put(`/api/users/${alice.id}`)
      .send({ name: "Alice", email: "bob@test.com" });

    expect(res.status).toBe(409);
  });
});

// ── PATCH /api/users/:id ──────────────────────────────────────────────────────
describe("PATCH /api/users/:id", () => {
  test("partially updates name only", async () => {
    const user = store.create({ name: "Old", email: "patch@test.com" });
    const res = await request(app)
      .patch(`/api/users/${user.id}`)
      .send({ name: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Updated");
    expect(res.body.data.email).toBe("patch@test.com");
  });

  test("returns 422 for empty patch body", async () => {
    const user = store.create({ name: "Alice", email: "alice@test.com" });
    const res = await request(app).patch(`/api/users/${user.id}`).send({});
    expect(res.status).toBe(422);
  });

  test("returns 404 for unknown id", async () => {
    const res = await request(app)
      .patch("/api/users/bad-id")
      .send({ name: "X name" });
    expect(res.status).toBe(404);
  });
});

// ── DELETE /api/users/:id ─────────────────────────────────────────────────────
describe("DELETE /api/users/:id", () => {
  test("deletes a user and returns 200", async () => {
    const user = store.create({ name: "Delete Me", email: "del@test.com" });
    const res = await request(app).delete(`/api/users/${user.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Confirm gone
    const check = await request(app).get(`/api/users/${user.id}`);
    expect(check.status).toBe(404);
  });

  test("returns 404 for unknown id", async () => {
    const res = await request(app).delete("/api/users/bad-id");
    expect(res.status).toBe(404);
  });
});

// ── 404 catch-all ─────────────────────────────────────────────────────────────
describe("Unknown routes", () => {
  test("returns 404 for undefined routes", async () => {
    const res = await request(app).get("/api/nonexistent");
    expect(res.status).toBe(404);
  });
});
