const { EntitySchema } = require("typeorm");

const Agent = new EntitySchema({
  name: "Agent",
  tableName: "agents",
  columns: {
    id: {
      primary: true,
      type: "varchar",
    },
    clientId: { type: "varchar" },
    clientSecret: { type: "varchar" },
    name: { type: "varchar" },
    note: { type: "varchar" },
    machineId: { type: "varchar", unique: true },
    departmentName: { type: "varchar" },
    modelType: { type: "varchar" },
    modelName: { type: "varchar" },
    companyId: { type: "varchar" },
    companyName: { type: "varchar" },
    branchId: { type: "varchar" },
    branchName: { type: "varchar" },
    lastSync: { type: "datetime", nullable: true },
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
    catracas: {
      type: "one-to-many",
      target: "Catraca",
      inverseSide: "agent",
    },
    printers: {
      type: "one-to-many",
      target: "Catraca",
      inverseSide: "agent",
    },
  },
});

module.exports = { Agent };
