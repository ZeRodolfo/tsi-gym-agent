const { EntitySchema } = require("typeorm");

const WorkTime = new EntitySchema({
  name: "WorkTime",
  tableName: "work_times",
  columns: {
    id: {
      primary: true,
      type: "varchar",
    },
    day: { type: "varchar" },
    startTime: { type: "varchar" },
    endTime: { type: "varchar" },

    teacherId: { type: "varchar", nullable: true },
    employeeId: { type: "varchar", nullable: true },
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
    teacher: {
      type: "many-to-one",
      target: "Teacher",
      joinColumn: { name: "teacherId" },
      eager: true,
      onDelete: "CASCADE",
    },
    employee: {
      type: "many-to-one",
      target: "Employee",
      joinColumn: { name: "employeeId" },
      eager: true,
      onDelete: "CASCADE",
    },
  },
});

module.exports = { WorkTime };
