const { EntitySchema } = require("typeorm");

const Catraca = new EntitySchema({
  name: "Catraca",
  tableName: "catraca",
  columns: {
    id: {
      primary: true,
      type: "varchar",
    },
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
    clientId: { type: "varchar" },
    clientSecret: { type: "varchar" },
    lastSync: { type: "datetime", nullable: true },
    createdAt: { type: "datetime", createDate: true },
    updatedAt: { type: "datetime", updateDate: true },
  },
  relations: {
    settings: {
      type: "one-to-one",
      target: "Settings",
      inverseSide: "catraca", // ✅ sem joinColumns aqui
      onDelete: "CASCADE",
    },
  },
});

module.exports = { Catraca };
