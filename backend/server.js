import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import rangerRoutes from "./routes/rangers.js";
import adminRoutes from "./routes/admin.js";
import verifyRoutes from "./routes/verify.js";
import logsRoute from "./routes/logs.js";
import { pool } from "./db.js";

const app = express();

// =============================
// CORS
// =============================
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());

// =============================
// Serve QR images
// =============================
app.use("/qrcodes", express.static("qrcodes"));

// =============================
// Check DB connection
// =============================
pool.query("SELECT NOW()", (err, result) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Database connected:", result.rows[0].now);
  }
});

// =============================
// API Routes
// =============================
app.use("/api/rangers", rangerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/logs", logsRoute);

// =============================
// Server start
// =============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
