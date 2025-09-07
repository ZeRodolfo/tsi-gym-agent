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
    ip: {
      type: "varchar",
    },
    port: {
      type: "int",
    },
    username: {
      type: "varchar",
      unique: true,
    },
    password: {
      type: "varchar",
    },
    customAuthMessage: {
      type: "varchar",
    },
    customDenyMessage: {
      type: "varchar",
    },
    customNotIdentifiedMessage: {
      type: "varchar",
    },
    customMaskMessage: {
      type: "varchar",
    },
    enableCustomAuthMessage: {
      type: "varchar",
    },
    enableCustomDenyMessage: {
      type: "varchar",
    },
    enableCustomNotIdentifiedMessage: {
      type: "varchar",
    },
    enableCustomMaskMessage: {
      type: "varchar",
    },
  },
});

module.exports = { Historic };
