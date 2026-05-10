// tests/unit/userStore.test.js
const store = require("../../src/models/userStore");

beforeEach(() => store.clear());

describe("UserStore", () => {
  describe("create()", () => {
    test("creates a user and returns it with an id", () => {
      const user = store.create({ name: "Alice", email: "alice@example.com" });
      expect(user).toMatchObject({
        name: "Alice",
        email: "alice@example.com",
        role: "user",
      });
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeDefined();
    });

    test("defaults role to 'user'", () => {
      const user = store.create({ name: "Bob", email: "bob@example.com" });
      expect(user.role).toBe("user");
    });

    test("respects provided role", () => {
      const user = store.create({
        name: "Admin",
        email: "admin@example.com",
        role: "admin",
      });
      expect(user.role).toBe("admin");
    });
  });

  describe("findAll()", () => {
    test("returns empty array when no users", () => {
      expect(store.findAll()).toEqual([]);
    });

    test("returns all created users", () => {
      store.create({ name: "A", email: "a@test.com" });
      store.create({ name: "B", email: "b@test.com" });
      expect(store.findAll()).toHaveLength(2);
    });
  });

  describe("findById()", () => {
    test("returns the user when found", () => {
      const created = store.create({ name: "Alice", email: "alice@test.com" });
      expect(store.findById(created.id)).toEqual(created);
    });

    test("returns null for unknown id", () => {
      expect(store.findById("non-existent-id")).toBeNull();
    });
  });

  describe("findByEmail()", () => {
    test("returns user when email matches", () => {
      const created = store.create({ name: "Alice", email: "alice@test.com" });
      expect(store.findByEmail("alice@test.com")).toEqual(created);
    });

    test("returns null when no match", () => {
      expect(store.findByEmail("nobody@test.com")).toBeNull();
    });
  });

  describe("update()", () => {
    test("updates fields and bumps updatedAt", async () => {
      const user = store.create({ name: "Old Name", email: "old@test.com" });
      const originalUpdatedAt = user.updatedAt;
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Ensure some ms pass
      const updated = store.update(user.id, { name: "New Name" });
      expect(updated.name).toBe("New Name");
      expect(updated.email).toBe("old@test.com"); // unchanged
      expect(updated.updatedAt).not.toBe(originalUpdatedAt);
    });

    test("returns null for unknown id", () => {
      expect(store.update("bad-id", { name: "X" })).toBeNull();
    });
  });

  describe("delete()", () => {
    test("returns true and removes the user", () => {
      const user = store.create({ name: "Delete Me", email: "del@test.com" });
      expect(store.delete(user.id)).toBe(true);
      expect(store.findById(user.id)).toBeNull();
    });

    test("returns false for unknown id", () => {
      expect(store.delete("bad-id")).toBe(false);
    });
  });
});
