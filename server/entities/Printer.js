const { EntitySchema } = require("typeorm");

const Printer = new EntitySchema({
  name: "Printer",
  tableName: "printers",
  columns: {
    id: {
      primary: true,
      type: "varchar",
    },
    name: { type: "varchar" },
    note: { type: "varchar", nullable: true },
    active: { type: "boolean", default: true },

    type: { type: "varchar" }, // epson, star, etc.
    clientId: { type: "varchar" },
    clientSecret: { type: "varchar" },

    ipAddress: { type: "varchar", nullable: true },
    port: { type: "int", nullable: true },
    // macAddress: { type: "varchar", nullable: true },
    connectionType: { type: "varchar", default: "usb" }, // usb, ethernet, wifi, etc.
    interface: { type: "varchar", nullable: true },
    // model: { type: "varchar", nullable: true },
    // driver: { type: "varchar", nullable: true },
    // serialNumber: { type: "varchar", nullable: true },
    paperWidth: { type: "int", default: 80 },
    autoCut: { type: "boolean", default: true },
    partialCut: { type: "boolean", default: true },
    charEncoding: { type: "varchar", nullable: true },

    agentId: { type: "varchar" },
    agentDeviceId: { type: "varchar" },
    departmentId: { type: "varchar" },
    companyId: { type: "varchar" },
    branchId: { type: "varchar" },

    createdByUserId: { type: "varchar" },
    updatedByUserId: { type: "varchar" },

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

module.exports = { Printer };
