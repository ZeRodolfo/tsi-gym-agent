const { EntitySchema } = require("typeorm");

const Employee = new EntitySchema({
  name: "Employee",
  tableName: "employees",
  columns: {
    id: {
      type: "varchar",
      primary: true, // chave principal real
    },
    personId: { type: "varchar" },
    companyId: { type: "varchar", nullable: true },
    branchId: { type: "varchar" },
    createdAt: { type: "datetime", createDate: true },
    updatedAt: { type: "datetime", updateDate: true },
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
      type: "one-to-one",
      target: "Person",
      inverseSide: "employee",
      joinColumn: { name: "personId" },
    },
    times: {
      type: "one-to-many",
      target: "WorkTime",
      inverseSide: "employee",
    },
    historics: {
      type: "one-to-many",
      target: "Historic",
      inverseSide: "employee",
    },
  },
  indices: [
    {
      name: "IDX_EMPLOYEE_ID",
      columns: ["id"],
      unique: true, // combinação única
    },
  ],
});

module.exports = { Employee };
