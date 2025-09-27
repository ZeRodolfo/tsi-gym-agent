const { EntitySchema } = require("typeorm");

const Enrollment = new EntitySchema({
  name: "Enrollment",
  tableName: "enrollments",
  columns: {
    id: {
      primary: true,
      type: "varchar",
      generated: false,
    },
    identifierCatraca: {
      type: "int",
      unique: true,
    },
    code: { type: "varchar", nullable: true },
    name: { type: "varchar" },
    picture: { type: "varchar" },
    startDate: { type: "date" },
    endDate: { type: "date" },
    extendedAt: { type: "date", nullable: true },
    status: { type: "varchar" },
    companyId: { type: "varchar" },
    branchId: { type: "varchar" },
    studentId: { type: "varchar" },
    studentName: { type: "varchar" },
    birthdate: { type: "varchar", nullable: true },
    addressZipcode: { type: "varchar", nullable: true },
    addressStreet: { type: "varchar", nullable: true },
    addressNumber: { type: "varchar", nullable: true },
    addressNeighborhood: { type: "varchar", nullable: true },
    addressComplement: { type: "varchar", nullable: true },
    addressCity: { type: "varchar", nullable: true },
    addressState: { type: "varchar", nullable: true },
    synced: { type: "boolean", default: false },
    createdAt: {
      type: "datetime",
      createDate: true,
    },
    updatedAt: {
      type: "datetime",
      updateDate: true,
    },
  },
  relations: {
    historics: {
      type: "one-to-many",
      target: "Historic",
      inverseSide: "enrollment",
    },
  },
});

module.exports = { Enrollment };
