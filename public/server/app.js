const express = require("express");
const cors = require("cors");
const routers = require("./routes"); // Importa as rotas

function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cors()); // Libera tudo (para dev)
  app.use(express.urlencoded({ extended: true })); // Para receber dados do formulário
  app.use("/api", routers); // Usa as rotas definidas

  app.listen(4000, () => {
    console.log("Servidor de acesso iniciado na porta 4000");
  });
}

module.exports = { startServer };
