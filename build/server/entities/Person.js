const { EntitySchema } = require("typeorm");

const Person = new EntitySchema({
  name: "Person",
  tableName: "people",
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
    addressId: { type: "varchar", nullable: true },
    companyId: { type: "varchar" },
    branchId: { type: "varchar" },
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
    // address: {
    //   type: "one-to-one",
    //   target: "Address",
    //   inverseSide: "person",
    //   cascade: true,
    // },
    address: {
      type: "one-to-one",
      target: "Address",
      inverseSide: "company",
      joinColumn: { name: "addressId" }, // ✅ define a FK corretamente
      cascade: true,
      onDelete: "SET NULL",
    },
    enrollments: {
      type: "one-to-many",
      target: "Enrollment",
      inverseSide: "person",
      cascade: true,
    },
    teacher: {
      type: "one-to-one",
      target: "Teacher",
      inverseSide: "person",
      cascade: true,
    },
    employee: {
      type: "one-to-one",
      target: "Employee",
      inverseSide: "person",
      cascade: true,
    },
    historics: {
      type: "one-to-many",
      target: "Historic",
      inverseSide: "person",
    },
  },
  indices: [
    {
      name: "IDX_PERSON_ID",
      columns: ["id", "identifierCatraca"],
      unique: true, // combinação única
    },
  ],
});

module.exports = { Person };
