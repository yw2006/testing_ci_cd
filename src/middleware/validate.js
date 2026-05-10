// src/middleware/validate.js

/**
 * Validates the request body for creating/updating a user.
 * Returns 422 with field-level errors on failure.
 */
function validateUser(req, res, next) {
  const errors = [];
  const { name, email, role } = req.body;
  const allowedRoles = ["user", "admin"];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push({
      field: "name",
      message: "Name must be at least 2 characters.",
    });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({
      field: "email",
      message: "A valid email address is required.",
    });
  }

  if (role !== undefined && !allowedRoles.includes(role)) {
    errors.push({
      field: "role",
      message: `Role must be one of: ${allowedRoles.join(", ")}.`,
    });
  }

  if (errors.length > 0) {
    return res.status(422).json({ success: false, errors });
  }

  next();
}

/**
 * Validates partial update (PATCH) — at least one valid field required.
 */
function validatePartialUser(req, res, next) {
  const errors = [];
  const { name, email, role } = req.body;
  const allowedRoles = ["user", "admin"];
  const hasAtLeastOneField =
    name !== undefined || email !== undefined || role !== undefined;

  if (!hasAtLeastOneField) {
    return res.status(422).json({
      success: false,
      errors: [
        {
          field: "body",
          message: "At least one field (name, email, role) is required.",
        },
      ],
    });
  }

  if (
    name !== undefined &&
    (typeof name !== "string" || name.trim().length < 2)
  ) {
    errors.push({
      field: "name",
      message: "Name must be at least 2 characters.",
    });
  }

  if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({
      field: "email",
      message: "A valid email address is required.",
    });
  }

  if (role !== undefined && !allowedRoles.includes(role)) {
    errors.push({
      field: "role",
      message: `Role must be one of: ${allowedRoles.join(", ")}.`,
    });
  }

  if (errors.length > 0) {
    return res.status(422).json({ success: false, errors });
  }

  next();
}

module.exports = { validateUser, validatePartialUser };
