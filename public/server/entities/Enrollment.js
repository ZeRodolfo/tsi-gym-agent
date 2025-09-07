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
    name: {
      type: "varchar",
    },
    picture: {
      type: "varchar",
    },
    startDate: {
      type: "date",
    },
    endDate: {
      type: "date",
    },
    status: {
      type: "date",
    },
    studentId: {
      type: "varchar",
    },
    studentName: {
      type: "varchar",
    },
  },
});

module.exports = { Enrollment };
