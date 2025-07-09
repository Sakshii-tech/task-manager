// src/routes/v1/projectRoutes.js
import express from "express";
import projectController from "../../controllers/projectController.js";
import {protect}  from "../../middleware/authMiddleware.js"; // your JWT middleware

const router = express.Router();

router.post("/", protect, projectController.create);

router.get('/', protect, projectController.getAll);

export default router;
