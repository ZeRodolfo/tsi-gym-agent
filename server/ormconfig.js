const { DataSource } = require("typeorm");
const sqlite3 = require("sqlite3"); // Importa explicitamente o módulo nativo
const { Enrollment } = require("./entities/Enrollment");
const { Catraca } = require("./entities/Catraca");
const { Settings } = require("./entities/Settings");
const { Historic } = require("./entities/Historic");

const AppDataSource = new DataSource({
  type: "sqlite",
  // Força o TypeORM a usar a biblioteca importada
  driver: sqlite3,
  database: "agent.db",
  synchronize: true, // cria/atualiza tabelas automaticamente
  logging: false,
  entities: [Enrollment, Catraca, Settings, Historic],
});

module.exports = {
  AppDataSource,
};
