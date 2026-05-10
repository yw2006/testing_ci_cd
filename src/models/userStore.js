// src/models/userStore.js
// In-memory store — swap this for a real DB (Postgres/Mongo) in production.
// The interface is intentionally the same so controllers don't change.

const { v4: uuidv4 } = require("uuid");

class UserStore {
  constructor() {
    this.users = new Map();
  }

  findAll() {
    return Array.from(this.users.values());
  }

  findById(id) {
    return this.users.get(id) || null;
  }

  findByEmail(email) {
    return this.findAll().find((u) => u.email === email) || null;
  }

  create({ name, email, role = "user" }) {
    const user = {
      id: uuidv4(),
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(user.id, user);
    return user;
  }

  update(id, fields) {
    const user = this.findById(id);
    if (!user) {return null};
    const updated = { ...user, ...fields, updatedAt: new Date().toISOString() };
    this.users.set(id, updated);
    return updated;
  }

  delete(id) {
    if (!this.users.has(id)) {return false};
    this.users.delete(id);
    return true;
  }

  clear() {
    this.users.clear();
  }
}

// Singleton — shared across the app; tests can call .clear() between runs
module.exports = new UserStore();
