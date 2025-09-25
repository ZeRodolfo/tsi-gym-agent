const { DataSource } = require("typeorm");
const { Enrollment } = require("./entities/Enrollment");
const { Catraca } = require("./entities/Catraca");
const { Settings } = require("./entities/Settings");
const { Historic } = require("./entities/Historic");

const AppDataSource = new DataSource({
  type: "sqlite",
  database: "agent.db",
  synchronize: true, // cria/atualiza tabelas automaticamente
  logging: false,
  entities: [Enrollment, Catraca, Settings, Historic],
});

module.exports = {
  AppDataSource,
};
