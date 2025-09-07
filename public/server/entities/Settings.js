const { EntitySchema } = require("typeorm");

const Settings = new EntitySchema({
  name: "Settings",
  tableName: "settings",
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

module.exports = { Settings };
