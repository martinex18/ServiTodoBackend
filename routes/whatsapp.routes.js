const express = require("express");
const router = express.Router();

const { sendWhatsApp } = require("../services/twilio.service");

router.post("/send", async (req, res) => {
  try {
    const { workerPhone, category, description, address } = req.body;

    const message = [
      "🔔 *Nueva solicitud - ServiTodo*",
      "",
      "📌 *Servicio:*",
      category,
      "",
      description
        ? `📝 *Descripción:*\n${description}\n`
        : "",
      address
        ? `📍 *Dirección:*\n${address}\n`
        : "",
      "Responde:",
      "",
      "1️⃣ ACEPTAR",
      "2️⃣ RECHAZAR",
    ]
      .filter(Boolean)
      .join("\n");

    const result = await sendWhatsApp(workerPhone, message);

    res.json({
      success: true,
      sid: result.sid,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;