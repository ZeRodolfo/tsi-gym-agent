const { EntitySchema } = require("typeorm");

const Enrollment = new EntitySchema({
  name: "Enrollment",
  tableName: "enrollments",
  columns: {
    id: {
      type: "varchar",
      primary: true, // chave principal real
    },
    identifierCatraca: {
      type: "int",
      nullable: false, // apenas normal
    },
    code: { type: "varchar", nullable: true },
    name: { type: "varchar" },
    picture: { type: "varchar", nullable: true },
    startDate: { type: "varchar" },
    endDate: { type: "varchar" },
    extendedAt: { type: "varchar", nullable: true },
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
    },
    updatedAt: {
      type: "datetime",
    },
  },
  relations: {
    historics: {
      type: "one-to-many",
      target: "Historic",
      inverseSide: "enrollment",
    },
  },
  indices: [
    {
      name: "IDX_ENROLLMENT_ID_CATRACA",
      columns: ["id", "identifierCatraca"],
      unique: true, // combinação única
    },
  ],
});

module.exports = { Enrollment };
