const { EntitySchema } = require("typeorm");

const Integration = new EntitySchema({
  name: "Integration",
  tableName: "integrations",
  columns: {
    id: {
      primary: true,
      type: "varchar",
    },
    source: { type: "varchar", nullable: false },
    eventType: { type: "varchar", nullable: false },
    eventData: { type: "varchar", nullable: false },
    code: { type: "varchar", nullable: true },
    codeSent: { type: "boolean", default: false },
    bookingNumber: { type: "varchar", nullable: true },
    uniqueToken: { type: "varchar", nullable: false },
    gymId: { type: "varchar", nullable: false },
    productId: { type: "varchar", nullable: true },
    slotId: { type: "varchar", nullable: true },
    classId: { type: "varchar", nullable: true },

    eventAt: { type: "datetime", nullable: false },
    expiresAt: { type: "datetime", nullable: true },
    checkinAt: { type: "datetime", nullable: true, default: null },
    companyId: { type: "varchar", nullable: true },
  },
  relations: {
    company: {
      type: "many-to-one",
      target: "Company",
      joinColumn: { name: "companyId" },
      onDelete: "SET NULL",
      nullable: true,
    },
  },
});

module.exports = { Integration };
