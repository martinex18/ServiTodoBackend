const express = require("express");
const router = express.Router();
const { db } = require("../config/firebaseAdmin");
const { buildNewRequestMessage } = require("../utils/whatsappMessages");
const { FieldValue } = require("firebase-admin/firestore");

const { sendWhatsApp } = require("../services/twilio.service");
const { findWorker } = require("../services/request.service");

router.post("/send", async (req, res) => {
  try {
    const { workerPhone, category, description, address } = req.body;

    const message = buildNewRequestMessage({ category, description, address });

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

router.post("/reply", async (req, res) => {
  try {
    const workerPhone = req.body.From.replace("whatsapp:", "").replace("+57", "");
    const reply = req.body.Body.trim().toUpperCase();

    console.log("Worker phone:", workerPhone);
    console.log("Reply:", reply);

    const workerSnapshot = await db.collection("users")
      .where("phone", "==", workerPhone)
      .where("role", "==", "worker")
      .limit(1)
      .get();

    console.log("Workers encontrados:", workerSnapshot.size);

    if (!workerSnapshot.empty) {
      console.log("Worker ID:", workerSnapshot.docs[0].id);
    }

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

    console.log("Requests encontradas:", requestSnapshot.size);

    if (requestSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: "Solicitud no encontrada",
      });
    }

    const request = requestSnapshot.docs[0];

    if (reply === "1" || reply === "ACEPTAR") {
      await request.ref.update({
        status: "found",
        workerAccepted: true,
        workerAcceptedAt: new Date(),
        workerName: worker.data().name,
        workerPhone: worker.data().phone,
      });
      console.log(
        "Solicitud aceptada"
      );
    }

    if (reply === "2" || reply === "RECHAZAR") {
      const rejectedWorkers = [
        ...(request.data().rejectedWorkers || []), // se busca en firestore el array
        worker.id,
      ];

      const result = await findWorker(request.data().serviceCategory, rejectedWorkers);
      console.log("Resultado búsqueda:", result);

      if (result.success) {
        const nextWorker = result.workers[0];

        await request.ref.update({
          workerId: nextWorker.id,
          workerName: nextWorker.name,
          workerPhone: nextWorker.phone,

          status: "pre_assigned",

          workerAccepted: false,
          workerRejectedAt: new Date(),

          rejectedWorkers,
          updatedAt: FieldValue.serverTimestamp(),
        });

        const message = buildNewRequestMessage({
          category: request.data().serviceCategory,
          description: request.data().serviceDescription,
          address: request.data().serviceAddress,
        });

        await sendWhatsApp(
          `+57${nextWorker.phone}`,
          message,
        );

        console.log("Re asignado a: ", nextWorker.name);
      } else {
        await request.ref.update({
          status: "not-found",

          workerId: null,
          workerName: null,
          workerPhone: null,

          workerAccepted: false,
          workerRejectedAt: new Date(),

          rejectedWorkers,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
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
});

module.exports = router;