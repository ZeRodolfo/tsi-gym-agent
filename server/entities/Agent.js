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
    name: { type: "varchar", nullable: true },
    note: { type: "varchar", nullable: true },
    machineId: { type: "varchar", unique: true },
    companyId: { type: "varchar", nullable: true },
    branchId: { type: "varchar", nullable: true },
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
      target: "Printer",
      inverseSide: "agent",
    },
  },
});

module.exports = { Agent };
