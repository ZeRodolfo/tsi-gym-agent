const { EntitySchema } = require("typeorm");

const Employee = new EntitySchema({
  name: "Employee",
  tableName: "employees",
  columns: {
    id: {
      type: "varchar",
      primary: true, // chave principal real
    },
    identifierCatraca: {
      type: "int",
      nullable: false, // apenas normal
    },
    name: { type: "varchar" },
    picture: { type: "varchar", nullable: true },
    birthdate: { type: "varchar", nullable: true },
    addressZipcode: { type: "varchar", nullable: true },
    addressStreet: { type: "varchar", nullable: true },
    addressNumber: { type: "varchar", nullable: true },
    addressNeighborhood: { type: "varchar", nullable: true },
    addressComplement: { type: "varchar", nullable: true },
    addressCity: { type: "varchar", nullable: true },
    addressState: { type: "varchar", nullable: true },

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
      columns: ["id", "identifierCatraca"],
      unique: true, // combinação única
    },
  ],
});

module.exports = { Employee };
