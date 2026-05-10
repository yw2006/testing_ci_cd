// tests/unit/validate.test.js
const {
  validateUser,
  validatePartialUser,
} = require("../../src/middleware/validate");

// Helpers to mock Express req / res / next
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = () => jest.fn();

// ── validateUser ──────────────────────────────────────────────────────────────
describe("validateUser middleware", () => {
  test("calls next() when body is valid", () => {
    const req = { body: { name: "Alice", email: "alice@example.com" } };
    const res = mockRes();
    const next = mockNext();

    validateUser(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("calls next() when role is valid", () => {
    const req = {
      body: { name: "Bob", email: "bob@example.com", role: "admin" },
    };
    const res = mockRes();
    const next = mockNext();

    validateUser(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("returns 422 when name is missing", () => {
    const req = { body: { email: "test@example.com" } };
    const res = mockRes();
    const next = mockNext();

    validateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
    const body = res.json.mock.calls[0][0];
    expect(body.errors.some((e) => e.field === "name")).toBe(true);
  });

  test("returns 422 when name is too short", () => {
    const req = { body: { name: "A", email: "test@example.com" } };
    const res = mockRes();
    const next = mockNext();

    validateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
  });

  test("returns 422 for invalid email", () => {
    const req = { body: { name: "Alice", email: "not-an-email" } };
    const res = mockRes();
    const next = mockNext();

    validateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    const body = res.json.mock.calls[0][0];
    expect(body.errors.some((e) => e.field === "email")).toBe(true);
  });

  test("returns 422 for invalid role", () => {
    const req = {
      body: { name: "Alice", email: "alice@example.com", role: "superadmin" },
    };
    const res = mockRes();
    const next = mockNext();

    validateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    const body = res.json.mock.calls[0][0];
    expect(body.errors.some((e) => e.field === "role")).toBe(true);
  });

  test("accumulates multiple errors", () => {
    const req = { body: { name: "", email: "bad" } };
    const res = mockRes();
    const next = mockNext();

    validateUser(req, res, next);

    const body = res.json.mock.calls[0][0];
    expect(body.errors.length).toBeGreaterThanOrEqual(2);
  });
});

// ── validatePartialUser ───────────────────────────────────────────────────────
describe("validatePartialUser middleware", () => {
  test("calls next() with at least one valid field", () => {
    const req = { body: { name: "Updated Name" } };
    const res = mockRes();
    const next = mockNext();

    validatePartialUser(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("returns 422 when body is empty", () => {
    const req = { body: {} };
    const res = mockRes();
    const next = mockNext();

    validatePartialUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
  });

  test("returns 422 for invalid partial email", () => {
    const req = { body: { email: "not-valid" } };
    const res = mockRes();
    const next = mockNext();

    validatePartialUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
  });
});
