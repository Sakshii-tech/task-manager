// src/routes/v1/projectRoutes.js
import express from "express";
import projectController from "../../controllers/projectController.js";
import {protect}  from "../../middleware/authMiddleware.js"; // your JWT middleware
import { createProjectSchema } from "../../validators/projectValidator.js";
import { validate } from "../../middleware/validate.js";
const router = express.Router();

router.post("/", protect, validate(createProjectSchema), projectController.create);

router.get('/', protect, projectController.getAll);

export default router;
