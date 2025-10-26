const { EntitySchema } = require("typeorm");

const Teacher = new EntitySchema({
  name: "Teacher",
  tableName: "teachers",
  columns: {
    id: {
      type: "varchar",
      primary: true, // chave principal real
    },
    personId: { type: "varchar" },
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
    person: {
      type: "one-to-one",
      target: "Person",
      inverseSide: "teacher",
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
      columns: ["id"],
      unique: true, // combinação única
    },
  ],
});

module.exports = { Teacher };
