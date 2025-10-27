const { EntitySchema } = require("typeorm");

const Enrollment = new EntitySchema({
  name: "Enrollment",
  tableName: "enrollments",
  columns: {
    id: {
      type: "varchar",
      primary: true, // chave principal real
    },
    code: { type: "varchar", nullable: true },
    startDate: { type: "varchar" },
    endDate: { type: "varchar" },
    extendedAt: { type: "varchar", nullable: true },
    status: { type: "varchar" },
    companyId: { type: "varchar" },
    branchId: { type: "varchar" },
    studentId: { type: "varchar" },
    personId: { type: "varchar" },
    companyId: { type: "varchar" },
    branchId: { type: "varchar" },
    createdAt: {
      type: "datetime",
    },
    updatedAt: {
      type: "datetime",
    },
  },
  relations: {
    company: {
      type: "many-to-one",
      target: "Company",
      joinColumn: { name: "companyId" },
      // eager: true,
      // nullable: true,
      // onDelete: "SET NULL", // em vez de cascade, seta nulo
    },
    person: {
      type: "many-to-one",
      target: "Person",
      inverseSide: "enrollment",
    },
    historics: {
      type: "one-to-many",
      target: "Historic",
      inverseSide: "enrollment",
    },
  },
  indices: [
    {
      name: "IDX_ENROLLMENT_ID_CATRACA",
      columns: ["id"],
      unique: true, // combinação única
    },
  ],
});

module.exports = { Enrollment };
