const { DataSource } = require("typeorm");
const sqlite3 = require("sqlite3"); // Importa explicitamente o módulo nativo
const path = require("path");
const { app } = require("electron");

const { Person } = require("./entities/Person");
const { Address } = require("./entities/Address");
const { Enrollment } = require("./entities/Enrollment");
const { Catraca } = require("./entities/Catraca");
const { Agent } = require("./entities/Agent");
const { Historic } = require("./entities/Historic");
const { Printer } = require("./entities/Printer");
const { Company } = require("./entities/Company");
const { Teacher } = require("./entities/Teacher");
const { Employee } = require("./entities/Employee");
const { WorkTime } = require("./entities/WorkTime");

const logger = require("./utils/logger");
const dbPath ="agent.db"
  // process.env.NODE_ENV === "development"
  //   ? "agent.db"
  //   : path.join(app.getPath("userData"), "agent.db");

logger.info("Database filename: " + dbPath);

const AppDataSource = new DataSource({
  type: "sqlite",
  // Força o TypeORM a usar a biblioteca importada
  driver: sqlite3,
  database: dbPath,
  synchronize: true, // cria/atualiza tabelas automaticamente
  logging: false,
  entities: [
    Person,
    Address,
    Enrollment,
    Catraca,
    Agent,
    Historic,
    Printer,
    Company,
    Teacher,
    Employee,
    WorkTime,
  ],
});

module.exports = {
  AppDataSource,
};
