const express = require("express");
const cors = require("cors");
require("dotenv").config();

const whatsappRoutes = require("./routes/whatsapp.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/whatsapp", whatsappRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
});