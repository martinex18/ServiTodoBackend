const express = require("express");
const cors = require("cors");
require("dotenv").config();
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const whatsappRoutes = require("./routes/whatsapp.routes");

const app = express();

const otpStore = {};

app.use(cors());
app.use(express.json());

app.use("/api/whatsapp", whatsappRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
});

app.post("/send-otp", async (req, res) => {
  try {
    const {phone} = req.body;

    if (!phone){
      return res.status(400).json({
        success: false,
        message: "Número requerido",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    otpStore[phone] = {
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `whatsapp:${phone}`,
      body: `🔐 Código de verificación ServiTodo

Tu código es:

${otp}

Válido por 5 minutos.`,
    });

    return res.json({
      success: true,
      message: "Codigo enviado",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.post("/verify-otp", async (req, res) => {
  try {
    const {phone, code} = req.body;
    const otpData = otpStore[phone];

    if(!otpData){
      return res.status(400).json({
        success: false,
        message: "Código no encontrado",
      });
    }

    if (Date.now() > otpData.expiresAt){
      delete otpStore[phone];
      return res.status(400).json({
        success: false,
        message: "Código expirado",
      });
    }

    if (otpData.code !== code){
      return res.status(400).json({
        success: false,
        message: "Código incorrecto",
      });
    }

    delete otpStore[phone];

    return res.json({
      success: true,
      message: "Código verificado",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
        success: false,
        message: error.message,
      });
    
  }
});

app.use("/api/whatsapp", whatsappRoutes);