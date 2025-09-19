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
    code: { type: "varchar" },
    name: { type: "varchar" },
    picture: { type: "varchar" },
    startDate: { type: "date" },
    endDate: { type: "date" },
    extendedAt: { type: "date" },
    status: { type: "varchar" },
    companyId: { type: "varchar" },
    branchId: { type: "varchar" },
    studentId: { type: "varchar" },
    studentName: { type: "varchar" },
    birthdate: { type: "varchar" },
    addressZipcode: { type: "varchar" },
    addressStreet: { type: "varchar" },
    addressNumber: { type: "varchar" },
    addressNeighborhood: { type: "varchar" },
    addressComplement: { type: "varchar" },
    addressCity: { type: "varchar" },
    addressState: { type: "varchar" },
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
