const { DataSource } = require("typeorm");
const sqlite3 = require("sqlite3"); // Importa explicitamente o módulo nativo
const path = require("path");
const { app } = require("electron");

const { Enrollment } = require("./entities/Enrollment");
const { Catraca } = require("./entities/Catraca");
const { Settings } = require("./entities/Settings");
const { Historic } = require("./entities/Historic");
const logger = require("./utils/logger");
const dbPath =
  process.env.NODE_ENV === "development"
    ? "agent.db"
    : path.join(app.getPath("userData"), "agent.db");

logger.info("Database filename: " + dbPath);
const AppDataSource = new DataSource({
  type: "sqlite",
  // Força o TypeORM a usar a biblioteca importada
  driver: sqlite3,
  database: dbPath,
  synchronize: true, // cria/atualiza tabelas automaticamente
  logging: false,
  entities: [Enrollment, Catraca, Settings, Historic],
});

module.exports = {
  AppDataSource,
};
