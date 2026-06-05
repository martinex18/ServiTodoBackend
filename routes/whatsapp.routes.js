const express = require("express");
const router = express.Router();

const { sendWhatsApp } = require("../services/twilio.service");

router.post("/send", async (req, res) => {
  try {
    const { to, message } = req.body;

    const result = await sendWhatsApp(to, message);

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