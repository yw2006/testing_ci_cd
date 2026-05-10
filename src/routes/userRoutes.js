// src/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/userController");
const { validateUser, validatePartialUser } = require("../middleware/validate");

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", validateUser, ctrl.create);
router.put("/:id", validateUser, ctrl.update);
router.patch("/:id", validatePartialUser, ctrl.patch);
router.delete("/:id", ctrl.remove);

module.exports = router;
