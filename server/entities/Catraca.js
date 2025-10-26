const { EntitySchema } = require("typeorm");

const Catraca = new EntitySchema({
  name: "Catraca",
  tableName: "catraca",
  columns: {
    id: {
      primary: true,
      type: "varchar",
    },
    clientId: { type: "varchar" },
    clientSecret: { type: "varchar" },
    name: { type: "varchar" },
    note: { type: "varchar" },
    departmentName: { type: "varchar" },
    modelType: { type: "varchar" },
    modelName: { type: "varchar" },
    type: { type: "varchar" }, // catraca, printer
    ip: { type: "varchar", nullable: true },
    port: { type: "int", nullable: true },
    username: { type: "varchar", nullable: true },
    password: { type: "varchar", nullable: true },
    ipLocal: { type: "varchar", nullable: true },
    catraSideToEnter: { type: "varchar", nullable: true },
    customAuthMessage: { type: "varchar", nullable: true },
    customDenyMessage: { type: "varchar", nullable: true },
    customNotIdentifiedMessage: { type: "varchar", nullable: true },
    customMaskMessage: { type: "varchar", nullable: true },
    enableCustomAuthMessage: { type: "varchar", nullable: true },
    enableCustomDenyMessage: { type: "varchar", nullable: true },
    enableCustomNotIdentifiedMessage: { type: "varchar", nullable: true },
    enableCustomMaskMessage: { type: "varchar", nullable: true },
    companyId: { type: "varchar" },
    branchId: { type: "varchar" },
    createdAt: { type: "datetime", createDate: true },
    updatedAt: { type: "datetime", updateDate: true },
  },
  relations: {
    company: {
      type: "many-to-one",
      target: "Company",
      joinColumn: { name: "companyId" },
      eager: true,
      onDelete: "CASCADE",
    },
    agent: {
      type: "many-to-one",
      target: "Agent",
      joinColumn: { name: "agentId" },
      eager: true,
      onDelete: "CASCADE",
    }
  },
});

module.exports = { Catraca };
