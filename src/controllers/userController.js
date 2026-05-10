// src/controllers/userController.js
const store = require("../models/userStore");

// GET /api/users
function getAll(req, res) {
  const users = store.findAll();
  res.json({ success: true, count: users.length, data: users });
}

// GET /api/users/:id
function getById(req, res) {
  const user = store.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }
  res.json({ success: true, data: user });
}

// POST /api/users
function create(req, res) {
  const { name, email, role } = req.body;

  // Duplicate email check
  if (store.findByEmail(email)) {
    return res
      .status(409)
      .json({ success: false, message: "Email already in use." });
  }

  const user = store.create({ name: name.trim(), email, role });
  res.status(201).json({ success: true, data: user });
}

// PUT /api/users/:id  — full replace
function update(req, res) {
  const existing = store.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  const { name, email, role } = req.body;

  // Duplicate email check (exclude self)
  const byEmail = store.findByEmail(email);
  if (byEmail && byEmail.id !== req.params.id) {
    return res
      .status(409)
      .json({ success: false, message: "Email already in use." });
  }

  const updated = store.update(req.params.id, {
    name: name.trim(),
    email,
    role,
  });
  res.json({ success: true, data: updated });
}

// PATCH /api/users/:id  — partial update
function patch(req, res) {
  const existing = store.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  const { name, email, role } = req.body;
  const fields = {};

  if (name !== undefined) {
    fields.name = name.trim()
  };
  if (email !== undefined) {
    const byEmail = store.findByEmail(email);
    if (byEmail && byEmail.id !== req.params.id) {
      return res
        .status(409)
        .json({ success: false, message: "Email already in use." });
    }
    fields.email = email;
  }
  if (role !== undefined) {
    fields.role = role
  };

  const updated = store.update(req.params.id, fields);
  res.json({ success: true, data: updated });
}

// DELETE /api/users/:id
function remove(req, res) {
  const deleted = store.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: "User not found." });
  }
  res
    .status(200)
    .json({ success: true, message: "User deleted successfully." });
}

module.exports = { getAll, getById, create, update, patch, remove };
