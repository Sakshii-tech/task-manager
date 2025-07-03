import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import swaggerUI from "swagger-ui-express";

import userRoutes from "./routes/v1/userRoutes.js";
import db from "./config/db.js";
import redisClient from "./config/redis.js";
import swaggerDefinition from "./api-doc/v1/main_doc.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Connect DB
try {
  await db.connect();
  console.log("✅ PostgreSQL connected successfully");
} catch (err) {
  console.error("❌ Failed to connect to PostgreSQL:", err.message);
}

// Connect Redis
try {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  console.log("✅ Redis connected successfully");
} catch (err) {
  console.error("❌ Redis connection failed:", err.message);
}

// Import Swagger JSON with assert
// const { default: swaggerDefinition } = await import(
//   "./api-doc/v1/main_doc.json",
//   { assert: { type: "json" } }
// );

app.use("/v1/api-doc", swaggerUI.serve, swaggerUI.setup(swaggerDefinition));

app.use("/api/v1/users", userRoutes);

app.use((req, res) => res.status(404).json({ error: "Not Found" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
