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
    personId: {
      type: "varchar",
      nullable: true,
    },
    studentId: {
      type: "varchar",
      nullable: true,
    },
    enrollmentId: {
      type: "varchar",
      nullable: true, // parte da FK composta
    },
    identifierCatraca: {
      type: "int",
      nullable: true, // parte da FK composta
    },
    teacherId: {
      type: "varchar",
      nullable: true, // parte da FK composta
    },
    employeeId: {
      type: "varchar",
      nullable: true, // parte da FK composta
    },
    catracaId: {
      type: "varchar",
      nullable: false,
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
    person: {
      type: "many-to-one",
      target: "Person",
      joinColumns: [
        {
          name: "personId",
          referencedColumnName: "id",
        },
      ],
      inverseSide: "historics",
      onDelete: "CASCADE",
    },
    enrollment: {
      type: "many-to-one",
      target: "Enrollment",
      joinColumns: [
        {
          name: "enrollmentId",
          referencedColumnName: "id",
        },
        {
          name: "identifierCatraca",
          referencedColumnName: "identifierCatraca",
        },
      ],
      inverseSide: "historics",
      onDelete: "CASCADE",
    },
    catraca: {
      type: "many-to-one",
      target: "Catraca",
      joinColumns: [
        {
          name: "catracaId",
          referencedColumnName: "id",
        },
      ],
      inverseSide: "historics",
      onDelete: "CASCADE",
    },
    employee: {
      type: "many-to-one",
      target: "Employee",
      joinColumns: [
        {
          name: "employeeId",
          referencedColumnName: "id",
        },
      ],
      inverseSide: "historics",
      onDelete: "CASCADE",
    },
    teacher: {
      type: "many-to-one",
      target: "Teacher",
      joinColumns: [
        {
          name: "teacherId",
          referencedColumnName: "id",
        },
      ],
      inverseSide: "historics",
      onDelete: "CASCADE",
    },
  },
});

module.exports = { Historic };
