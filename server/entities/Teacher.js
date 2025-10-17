const { EntitySchema } = require("typeorm");

const Teacher = new EntitySchema({
  name: "Teacher",
  tableName: "teachers",
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
    picture: { type: "varchar" },
    birthdate: { type: "varchar", nullable: true },
    addressZipcode: { type: "varchar", nullable: true },
    addressStreet: { type: "varchar", nullable: true },
    addressNumber: { type: "varchar", nullable: true },
    addressNeighborhood: { type: "varchar", nullable: true },
    addressComplement: { type: "varchar", nullable: true },
    addressCity: { type: "varchar", nullable: true },
    addressState: { type: "varchar", nullable: true },

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
    times: {
      type: "one-to-many",
      target: "WorkTime",
      inverseSide: "teacher",
    },
     historics: {
      type: "one-to-many",
      target: "Historic",
      inverseSide: "teacher",
    },
  },
  indices: [
    {
      name: "IDX_TEACHER_ID",
      columns: ["id", "identifierCatraca"],
      unique: true, // combinação única
    },
  ],
});

module.exports = { Teacher };
