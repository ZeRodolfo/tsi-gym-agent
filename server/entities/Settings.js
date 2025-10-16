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
    type: { type: "varchar" }, // catraca, printer
    ip: { type: "varchar", nullable: true },
    port: { type: "int", nullable: true },
    username: { type: "varchar", nullable: true },
    password: { type: "varchar", nullable: true },
    ipLocal: { type: "varchar", nullable: true },
    catraSideToEnter: { type: "varchar", nullable: true },
    customAuthMessage: { type: "varchar", nullable: true },
    customDenyMessage: { type: "varchar", nullable: true },
    customNotIdentifiedMessage: { type: "varchar", nullable: true },
    customMaskMessage: { type: "varchar", nullable: true },
    enableCustomAuthMessage: { type: "varchar", nullable: true },
    enableCustomDenyMessage: { type: "varchar", nullable: true },
    enableCustomNotIdentifiedMessage: { type: "varchar", nullable: true },
    enableCustomMaskMessage: { type: "varchar", nullable: true },
    catracaId: {
      type: "varchar",
      nullable: true,
    },
    printerId: {
      type: "varchar",
      nullable: true,
    },
  },
  relations: {
    catraca: {
      type: "one-to-one",
      target: "Catraca",
      joinColumn: { name: "catracaId", referencedColumnName: "id" }, // ✅ aqui é o lado dono
      inverseSide: "settings",
      onDelete: "CASCADE",
    },
    printer: {
      type: "one-to-one",
      target: "Printer",
      joinColumn: { name: "printerId", referencedColumnName: "id" }, // ✅ aqui é o lado dono
      inverseSide: "settings",
      onDelete: "CASCADE",
    },
  },
});

module.exports = { Settings };
