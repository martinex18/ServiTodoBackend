const express = require("express");
const router = express.Router();
const { db } = require("../config/firebaseAdmin");
const { FieldValue } = require("firebase-admin/firestore");

const { findWorker } = require("../services/request.service");
const { sendWhatsApp } = require("../services/twilio.service");
const { buildNewRequestMessage } = require("../utils/whatsappMessages");

router.post("/create", async (req, res) => {
    try {
        const { clientId, clientName, clientPhone, serviceCategory, serviceDescription, serviceAddress, serviceDate } = req.body;

        const requestRef = await db.collection("requests").add({
            clientId,
            clientName,
            clientPhone,

            serviceCategory,
            serviceDescription,
            serviceAddress,
            serviceDate,

            requestType: "direct",

            workerId: null,
            workerName: null,
            workerPhone: null,

            status: "searching",

            assignedAt: null,
            completedAt: null,
            cancelledAt: null,

            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        const result = await findWorker(serviceCategory);

        if (result.success && result.workers.length > 0) {
            const worker = result.workers[0];
            await requestRef.update({
                workerId: worker.id,
                status: "pre_assigned",
                updatedAt: FieldValue.serverTimestamp(),
            });
            
            const message = buildNewRequestMessage({ category: serviceCategory, description: serviceDescription, address: serviceAddress });
            await sendWhatsApp(
                `+57${worker.phone}`,
                message,
            );
        }

        return res.json({
            success: true,
            requestId: requestRef.id,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;