const express = require("express");
const router = express.Router();
const { db } = require("../config/firebaseAdmin");

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

/*router.post("/reply", async (req, res) => {
  try {
    const workerPhone = req.body.From.replace("whatsapp:", "");
    const reply = req.body.Body.trim().toUpperCase();

    const workerSnapshot = await db.collection("users")
      .where("phone", "==", workerPhone)
      .get();

    if (workerSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: "Trabajador no encontrado",
      });
    }
    const worker = workerSnapshot.docs[0];

    const requestSnapshot = await db.collection("requests")
      .where("workerId", "==", worker.id)
      .where("status", "==", "pre_assigned").limit(1)
      .get();

    if (requestSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: "Solicitud no encontrada",
      });
    }

    const request = requestSnapshot.docs[0];

    if (reply === "1" || reply === "ACEPTAR") {
      await request.ref.update({
        workerAccepted: true,
        workerAcceptedAt: new Date(),
      });
    }

    if (reply === "2" || reply === "RECHAZAR") {
      await request.ref.update({
        workerAccepted: false,
        workerRejectedAt: new Date(),
      });
    }

    return res.json({
      success: true,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}); */

router.post("/reply", async (req, res) => {
  try {

    console.log("================================");
    console.log("MENSAJE RECIBIDO DE WHATSAPP");
    console.log(req.body);
    console.log("================================");

    return res.sendStatus(200);

  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

module.exports = router;