import express from "express";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../db.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// Path where QR images are stored
const qrDir = path.join(process.cwd(), "qrcodes");

// Create the folder if missing
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
  console.log("✅ qrcodes folder created");
}

// =======================================================
// CREATE RANGER + QR
// =======================================================
router.post("/create", async (req, res) => {
  try {
    const { name, role } = req.body;

    if (!name || !role) {
      return res.status(400).json({ error: "Name and Role required" });
    }

    // Insert ranger
    const insert = await pool.query(
      "INSERT INTO rangers (name, role) VALUES ($1, $2) RETURNING id",
      [name, role]
    );

    const rangerId = insert.rows[0].id;

    // Generate unique token
    const token = uuidv4();
    const fileName = `${token}.png`;
    const filePath = path.join(qrDir, fileName);

    // Create QR file
    await QRCode.toFile(filePath, token);

    // Update row with token only
    await pool.query(
      "UPDATE rangers SET qr_token = $1 WHERE id = $2",
      [token, rangerId]
    );

    // Local file URL
    const qrUrl = `http://localhost:5000/qrcodes/${fileName}`;

    res.json({
      success: true,
      ranger_id: rangerId,
      token,
      qrUrl,
    });

  } catch (err) {
    console.error("🔥 CREATE ERROR:", err);
    res.status(500).json({ error: "Server Error", details: err.message });
  }
});

// =======================================================
// SHOW BY RANGER ID  (ONLY THIS NOW)
// =======================================================
router.get("/show/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM rangers WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Ranger not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error("🔥 SHOW BY ID ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =======================================================
// LIST ALL RANGERS
// =======================================================
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM rangers ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("🔥 FETCH ERROR:", err);
    res.status(500).json({ error: "Failed to fetch" });
  }
});

export default router;
