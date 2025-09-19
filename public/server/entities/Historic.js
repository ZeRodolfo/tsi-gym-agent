const { EntitySchema } = require("typeorm");

const Historic = new EntitySchema({
  name: "Historic",
  tableName: "historics",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    studentId: {
      type: "varchar",
      nullable: true,
    },
    enrollmentId: {
      type: "varchar",
      nullable: true,
    },
    companyId: {
      type: "varchar",
      nullable: true,
    },
    branchId: {
      type: "varchar",
      nullable: true,
    },
    type: {
      type: "varchar",
      default: "terminal", // terminal | manually
    },
    attendedAt: {
      type: "datetime",
      nullable: false,
    },
    status: {
      type: "varchar",
      nullable: false,
    },
    message: {
      type: "varchar",
      nullable: false,
    },
    reasonId: {
      type: "varchar",
      nullable: true,
    },
    synced: {
      type: "boolean",
      default: false,
    },
  },
  relations: {
    enrollment: {
      type: "many-to-one",
      target: "Enrollment",
      joinColumn: {
        name: "enrollmentId", // FK na tabela historics
      },
      inverseSide: "historics",
      onDelete: "CASCADE",
    },
  },
});

module.exports = { Historic };
