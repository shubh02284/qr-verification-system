import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ================================
// 📌 GET ALL LOG ENTRIES
// ================================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         l.id,
         l.created_by,
         l.role,
         l.qr_token,
         l.created_at,
         r.name AS ranger_name,
         r.id AS ranger_id
       FROM qr_logs l
       LEFT JOIN rangers r ON r.id = l.ranger_id
       ORDER BY l.created_at DESC`
    );

    res.json(result.rows);

  } catch (err) {
    console.error("LOG FETCH ERROR:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

export default router;
