import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// Get all rangers
router.get("/rangers", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM rangers ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("ADMIN ERROR:", err);
    res.status(500).json({ error: "Failed to fetch rangers" });
  }
});


// Delete ranger
router.delete("/rangers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM rangers WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Failed to delete ranger" });
  }
});

export default router;
