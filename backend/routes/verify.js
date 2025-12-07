import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// 📌 VERIFY QR TOKEN
router.get("/", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ status: "NO_TOKEN_PROVIDED" });
  }

  try {
    // Check DB for match
    const result = await pool.query(
      "SELECT * FROM rangers WHERE qr_token = $1 LIMIT 1",
      [token]
    );

    if (result.rows.length === 0) {
      return res.json({ status: "INVALID", message: "QR not found" });
    }

    const ranger = result.rows[0];

    res.json({
      status: "VALID",
      ranger: {
        id: ranger.id,
        name: ranger.name,
        role: ranger.role,
        created_at: ranger.created_at,
        qr_url: `http://localhost:5000/qrcodes/${ranger.qr_token}.png`
      }
    });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ status: "ERROR" });
  }
});

export default router;
